#include "Ocr.h"

#include <drogon/HttpClient.h>
#include <drogon/HttpResponse.h>
#include <drogon/HttpTypes.h>
#include <drogon/MultiPart.h>
#include <json/reader.h>
#include <trantor/utils/Logger.h>

#include <cstdio>
#include <fstream>

const bool FAKING = false;

// Add definition of your processing function here
void Ocr::upload(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    // just testing if veryfi ocr works
    // theoretically client should just send an image and we should contact endpoint
    // somewhere else
    // then return a jsonified menu with all the options in the client
    // finally the client verifies the info and then hits this endpoint to upload
    // the menu

    if (FAKING) {
        Json::Reader reader;
        Json::Value fakeJson;
        std::string jsonPath = "../fakedata/veryfi_response.json";
        std::ifstream in(jsonPath);
        std::ostringstream sstr;
        sstr << in.rdbuf();
        reader.parse(sstr.str(), fakeJson);

        HttpResponsePtr response = HttpResponse::newHttpJsonResponse(fakeJson);
        callback(response);
        return;
    }

    const std::string ocrApi = std::getenv("OCR_API");
    if (ocrApi.empty()) {
        LOG_ERROR << "getenv failed on ocr api";
        return;
    }
    const std::string ocrApiPath = std::getenv("OCR_API_PATH");
    if (ocrApiPath.empty()) {
        LOG_ERROR << "getenv failed on ocr api path";
        return;
    }
    const std::string ocrClientId = std::getenv("OCR_CLIENT_ID");
    if (ocrClientId.empty()) {
        LOG_ERROR << "getenv failed on ocr client id";
        return;
    }
    const std::string ocrApiKey = std::getenv("OCR_API_KEY");
    if (ocrApiKey.empty()) {
        LOG_ERROR << "getenv failed on ocr api key";
        return;
    }
    const std::string ocrUsername = std::getenv("OCR_USERNAME");
    if (ocrUsername.empty()) {
        LOG_ERROR << "getenv failed on ocr username";
        return;
    }

    MultiPartParser fileParser;
    fileParser.parse(req);
    if (fileParser.getFiles().empty()) {
        callback(HttpResponse::newHttpResponse(drogon::k400BadRequest, drogon::CT_APPLICATION_JSON));
        LOG_ERROR << "no file found";
        return;
    }
    HttpFile theFile = fileParser.getFiles()[0];
    std::string savedName = "./tempFiles/" + req->session()->sessionId() + "." + theFile.getFileExtension().data();
    theFile.saveAs(savedName);
    std::ifstream in(savedName);
    std::ostringstream sstr;
    sstr << in.rdbuf();
    std::string encodedFile = utils::base64Encode(sstr.str(), false, true);

    // remove file after we're done using it
    std::remove(savedName.data());

    auto client = HttpClient::newHttpClient(ocrApi);
    auto request = HttpRequest::newHttpRequest();
    request->setMethod(HttpMethod::Post);
    request->setPath(ocrApiPath);
    request->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
    request->addHeader("CLIENT-ID", ocrClientId);
    request->addHeader("Accept", "application/json");
    std::string auth = std::string("apikey " + ocrUsername + ":" + ocrApiKey);
    request->addHeader("AUTHORIZATION", auth);

    Json::Value body;
    body["file_data"] = encodedFile;
    body["template_name"] = "restaurant_menu";
    // need this writer to make the json into a string
    Json::FastWriter writer;
    std::string bodyStr = writer.write(body);
    LOG_INFO << bodyStr;
    request->setBody(bodyStr);
    LOG_INFO << "after setting request body";

    Json::Value respBody;
    auto lamb = [&respBody](ReqResult result, const HttpResponsePtr& response) {
        if (result != ReqResult::Ok) {
            LOG_ERROR << "request isn't ok";
            return;
        }
        Json::Reader reader;
        if (reader.parse(response->getBody().data(), respBody)) {
            LOG_INFO << "success";
        } else {
            LOG_INFO << "fail";
        }
        LOG_INFO << response->getBody().data();
    };
    auto res = client->sendRequest(request);
    lamb(res.first, res.second);
    LOG_INFO << "responsing";
    HttpResponsePtr response = HttpResponse::newHttpJsonResponse(respBody);
    callback(response);
}

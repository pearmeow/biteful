#include "Ocr.h"

#include <drogon/HttpClient.h>

#include <fstream>

const bool FAKING = true;

// Add definition of your processing function here
void Ocr::upload(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    // just testing if veryfi ocr works
    // theoretically client should just send an image and we should contact endpoint
    // somewhere else
    // then return a jsonified menu with all the options in the client
    // finally the client verifies the info and then hits this endpoint to upload
    // the menu
    //

    // if (FAKING) {
    //     return;
    // }

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
    LOG_INFO << "before client";
    auto client = HttpClient::newHttpClient(ocrApi);
    LOG_INFO << "after client";
    auto request = HttpRequest::newHttpRequest();
    request->setMethod(HttpMethod::Post);
    request->setPath(ocrApiPath);
    request->setContentTypeCode(ContentType::CT_APPLICATION_JSON);
    request->addHeader("CLIENT-ID", ocrClientId);
    request->addHeader("Accept", "application/json");
    std::string auth = std::string("apikey ph2425:") + ocrApiKey;
    LOG_INFO << "auth " << auth;
    request->addHeader("AUTHORIZATION", auth);
    LOG_INFO << "after setting stuff";

    // basically reads a whole file and encodes it to base64
    std::string imagePath = "/home/pearmeow/Downloads/menu.png";
    std::ifstream in(imagePath);
    std::ostringstream sstr;
    sstr << in.rdbuf();
    std::string encodedFile = utils::base64Encode(sstr.str(), false, false);
    LOG_INFO << "after image";

    Json::Value body;
    body["file_data"] = encodedFile;
    body["template_name"] = "restaurant_menu";
    LOG_INFO << "bodyStr";
    // need this writer to make the json into a string
    Json::FastWriter writer;
    std::string bodyStr = writer.write(body);
    LOG_INFO << bodyStr;
    request->setBody(bodyStr);
    LOG_INFO << "after setting request body";

    client->sendRequest(request, [](ReqResult result, const HttpResponsePtr& response) {
        if (result != ReqResult::Ok) {
            LOG_ERROR << "request isn't ok";
            return;
        }
        std::cout << "response gotten " << std::endl;
        std::cout << response->getBody() << std::endl;
    });
    HttpResponsePtr response = HttpResponse::newHttpResponse();
    response->setStatusCode(drogon::k200OK);
    callback(response);
}

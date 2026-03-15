#include "Auth.h"

#include <drogon/HttpResponse.h>
#include <drogon/HttpTypes.h>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Exception.h>
#include <drogon/orm/Result.h>

#include <string>

#include "../plugins/SodiumPlugin.h"

// POST /auth
void Auth::login(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    auto json = req->getJsonObject();
    if (!json) {
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    std::string email = json->get("username", "").asString();
    std::string password = json->get("password", "").asString();

    auto dbClient = drogon::app().getDbClient();
    dbClient->execSqlAsync(
        "SELECT id, password_hash FROM Users WHERE username = $1",
        [req, callback, password](const drogon::orm::Result& res) {
            if (res.size() > 0) {
                auto* sodium = drogon::app().getPlugin<SodiumPlugin>();
                std::string storedHash = res[0]["password_hash"].as<std::string>();

                if (sodium->verifyPassword(password, storedHash)) {
                    Json::Value ret;
                    ret["loggedIn"] = "true";
                    std::string id = req->session()->sessionId();
                    ret["id"] = id;
                    auto resp = drogon::HttpResponse::newHttpJsonResponse(ret);
                    req->session()->insert("loggedIn", true);
                    callback(resp);
                    return;
                }
            }
            // Unauthorized Case
            auto resp = drogon::HttpResponse::newHttpResponse();
            resp->setStatusCode(drogon::k401Unauthorized);
            callback(resp);
        },
        [callback](const drogon::orm::DrogonDbException& e) {
            auto resp = drogon::HttpResponse::newHttpResponse();
            resp->setStatusCode(drogon::k500InternalServerError);
            callback(resp);
        },
        email);
}

// DELETE /auth/id
// where id is the session id
void Auth::logout(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback,
                  const std::string& sessionId) {
    // if you've tried to delete a session id which is not yours
    if (req->session()->sessionId() != sessionId) {
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setStatusCode(drogon::k401Unauthorized);
        callback(resp);
        return;
    }

    // NOTE: Just for debugging
    Json::Value ret;
    ret["result"] = "logged_out";

    auto resp = drogon::HttpResponse::newHttpJsonResponse(ret);
    // need to send a set cookie over here to delete the cookie
    // JSESSIONID is the default "key" in the json file
    resp->removeCookie("JSESSIONID");
    req->session()->clear();
    callback(resp);
}

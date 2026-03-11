#include <drogon/HttpResponse.h>
#include <drogon/HttpTypes.h>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Exception.h>
#include <drogon/orm/Result.h>

#include <string>

#include "../plugins/SodiumPlugin.h"
#include "Auth.h"

// POST /auth/login
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
        [callback, password](const drogon::orm::Result& res) {
            if (res.size() > 0) {
                auto* sodium = drogon::app().getPlugin<SodiumPlugin>();
                std::string storedHash = res[0]["password_hash"].as<std::string>();

                if (sodium->verifyPassword(password, storedHash)) {
                    Json::Value ret;
                    ret["token"] = "jwt_token_example";
                    auto resp = drogon::HttpResponse::newHttpJsonResponse(ret);
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

// POST /auth/logout
void Auth::logout(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    Json::Value ret;
    ret["result"] = "logged_out";
    auto resp = drogon::HttpResponse::newHttpJsonResponse(ret);
    callback(resp);
}

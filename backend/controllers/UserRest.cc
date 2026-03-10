#include "UserRest.h"

#include <drogon/orm/DbClient.h>

#include "../plugins/SodiumPlugin.h"

using namespace drogon;

// POST /users
void UserRest::create(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    auto json = req->getJsonObject();
    if (!json) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    std::string username = json->get("username", "").asString();
    std::string email = json->get("email", "").asString();
    std::string password = json->get("password", "").asString();

    if (username.empty() || email.empty() || password.empty()) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    auto* auth = app().getPlugin<SodiumPlugin>();
    std::string hashed = auth->hashPassword(password);
    auto dbClient = app().getDbClient();

    dbClient->execSqlAsync(
        "INSERT INTO Users (username, email, password_hash) VALUES ($1, $2, $3)",
        [callback](const drogon::orm::Result& res) {
            Json::Value ret;
            ret["result"] = "ok";
            auto resp = HttpResponse::newHttpJsonResponse(ret);
            resp->setStatusCode(k201Created);
            callback(resp);
        },
        [callback](const drogon::orm::DrogonDbException& e) {
            LOG_ERROR << e.base().what();
            auto resp = HttpResponse::newHttpResponse();
            resp->setStatusCode(k409Conflict);
            callback(resp);
        },
        username, email, hashed);
}

// GET /users/{id}
void UserRest::getOne(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback,
                      std::string&& id) {
    auto dbClient = app().getDbClient();
    dbClient->execSqlAsync(
        "SELECT id, username, email FROM Users WHERE id = $1",
        [callback](const drogon::orm::Result& res) {
            if (res.size() == 0) {
                auto resp = HttpResponse::newHttpResponse();
                resp->setStatusCode(k404NotFound);
                callback(resp);
                return;
            }
            Json::Value user;
            user["id"] = res[0]["id"].as<int>();
            user["username"] = res[0]["username"].as<std::string>();
            user["email"] = res[0]["email"].as<std::string>();
            auto resp = HttpResponse::newHttpJsonResponse(user);
            resp->setStatusCode(k200OK);
            callback(resp);
        },
        [callback](const drogon::orm::DrogonDbException& e) {
            auto resp = HttpResponse::newHttpResponse();
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },
        id);
}

void UserRest::updateOne(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback,
                         std::string&& id) {
    auto resp = HttpResponse::newHttpResponse();
    resp->setStatusCode(k501NotImplemented);
    callback(resp);
}

void UserRest::deleteOne(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback,
                         std::string&& id) {
    auto dbClient = app().getDbClient();
    dbClient->execSqlAsync(
        "DELETE FROM Users WHERE id = $1",
        [callback](const drogon::orm::Result& res) {
            auto resp = HttpResponse::newHttpResponse();
            resp->setStatusCode(k204NoContent);
            callback(resp);
        },
        [callback](const drogon::orm::DrogonDbException& e) {
            auto resp = HttpResponse::newHttpResponse();
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },
        id);
}

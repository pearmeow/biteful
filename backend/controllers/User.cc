#include "User.h"

#include <drogon/orm/DbClient.h>

#include "../plugins/SodiumPlugin.h"

using namespace drogon;

// POST /users
void User::create(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
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
        "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)",
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
void User::getOne(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback,
                  std::string&& id) {
    auto dbClient = app().getDbClient();

    // Capture id by value since we use it in nested lambda
    std::string userId = id;

    dbClient->execSqlAsync(
        "SELECT id, username, email, display_name, dietary_preferences, health_score FROM users WHERE id = $1",
        [callback, dbClient, userId](const drogon::orm::Result& res) {
            if (res.size() == 0) {
                auto resp = HttpResponse::newHttpResponse();
                resp->setStatusCode(k404NotFound);
                callback(resp);
                return;
            }

            Json::Value user;
            user["id"]                  = res[0]["id"].as<int>();
            user["username"]            = res[0]["username"].as<std::string>();
            user["email"]               = res[0]["email"].as<std::string>();
            user["display_name"]        = res[0]["display_name"].isNull() ? "" : res[0]["display_name"].as<std::string>();
            user["dietary_preferences"] = res[0]["dietary_preferences"].isNull() ? "" : res[0]["dietary_preferences"].as<std::string>();
            user["health_score"]        = res[0]["health_score"].isNull() ? 0 : res[0]["health_score"].as<int>();

            // Fetch food logs for this user
            dbClient->execSqlAsync(
                "SELECT item_name, health_points, logged_at FROM food_logs WHERE user_id = $1 ORDER BY logged_at DESC LIMIT 20",
                [callback, user](const drogon::orm::Result& logs) mutable {
                    Json::Value logArray(Json::arrayValue);
                    for (const auto& row : logs) {
                        Json::Value entry;
                        entry["item_name"]     = row["item_name"].as<std::string>();
                        entry["health_points"] = row["health_points"].as<int>();
                        entry["logged_at"]     = row["logged_at"].as<std::string>();
                        logArray.append(entry);
                    }
                    user["food_logs"] = logArray;

                    auto resp = HttpResponse::newHttpJsonResponse(user);
                    resp->setStatusCode(k200OK);
                    callback(resp);
                },
                [callback](const drogon::orm::DrogonDbException& e) {
                    auto resp = HttpResponse::newHttpResponse();
                    resp->setStatusCode(k500InternalServerError);
                    callback(resp);
                },
                userId);
        },
        [callback](const drogon::orm::DrogonDbException& e) {
            auto resp = HttpResponse::newHttpResponse();
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },
        userId);
}

void User::updateOne(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback,
                     std::string&& id) {
    auto json = req->getJsonObject();
    if (!json) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    std::string displayName = json->get("display_name", "").asString();
    std::string dietaryPrefs = json->get("dietary_preferences", "").asString();

    auto dbClient = app().getDbClient();
    dbClient->execSqlAsync(
        "UPDATE users SET display_name = $1, dietary_preferences = $2 WHERE id = $3",
        [callback](const drogon::orm::Result& res) {
            Json::Value ret;
            ret["result"] = "updated";
            auto resp = HttpResponse::newHttpJsonResponse(ret);
            resp->setStatusCode(k200OK);
            callback(resp);
        },
        [callback](const drogon::orm::DrogonDbException& e) {
            LOG_ERROR << e.base().what();
            auto resp = HttpResponse::newHttpResponse();
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },
        displayName, dietaryPrefs, id);
}

void User::deleteOne(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback,
                     std::string&& id) {
    auto dbClient = app().getDbClient();
    dbClient->execSqlAsync(
        "DELETE FROM users WHERE id = $1",
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

void User::logFood(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback,
                   std::string&& id) {
    auto json = req->getJsonObject();
    if (!json) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    std::string itemName  = json->get("item_name", "").asString();
    int healthPoints      = json->get("health_points", 0).asInt();

    if (itemName.empty()) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    std::string userId = id;
    auto dbClient = app().getDbClient();

    dbClient->execSqlAsync(
        "INSERT INTO food_logs (user_id, item_name, health_points) VALUES ($1, $2, $3)",
        [callback, dbClient, userId, healthPoints](const drogon::orm::Result& res) {
            // Update the running health_score total (fr1.5)
            dbClient->execSqlAsync(
                "UPDATE users SET health_score = health_score + $1 WHERE id = $2",
                [callback](const drogon::orm::Result&) {
                    Json::Value ret;
                    ret["result"] = "logged";
                    auto resp = HttpResponse::newHttpJsonResponse(ret);
                    resp->setStatusCode(k201Created);
                    callback(resp);
                },
                [callback](const drogon::orm::DrogonDbException& e) {
                    auto resp = HttpResponse::newHttpResponse();
                    resp->setStatusCode(k500InternalServerError);
                    callback(resp);
                },
                healthPoints, userId);
        },
        [callback](const drogon::orm::DrogonDbException& e) {
            LOG_ERROR << e.base().what();
            auto resp = HttpResponse::newHttpResponse();
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },
        userId, itemName, healthPoints);
}
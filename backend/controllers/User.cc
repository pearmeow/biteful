#include "User.h"
#include <drogon/orm/DbClient.h>
#include "../plugins/SodiumPlugin.h"
using namespace drogon;

// valid func
bool isValidId(const std::string& id) {
    if (id.empty()) return false;
    char* end;
    long val = std::strtol(id.c_str(), &end, 10);
    return *end == '\0' && val >= 0;
}

// POST /users
// create account (fr1.1)
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
// read and view profile (fr1.2) 
void User::getOne(const HttpRequestPtr& req,
                 std::function<void(const HttpResponsePtr&)>&& callback,
                 std::string&& id) {
    
    char* end;

    // validation
    if (!isValidId(id)) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    auto dbClient = app().getDbClient();
    std::string userId = id;

    dbClient->execSqlAsync(
        "SELECT id, username, email, phone, display_name, dietary_preferences, health_score "
        "FROM users WHERE id = $1",
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
            user["phone"]               = res[0]["phone"].isNull() ? "" : res[0]["phone"].as<std::string>();
            user["display_name"]        = res[0]["display_name"].isNull() ? "" : res[0]["display_name"].as<std::string>();
            user["dietary_preferences"] = res[0]["dietary_preferences"].isNull() ? "" : res[0]["dietary_preferences"].as<std::string>();
            user["health_score"]        = res[0]["health_score"].isNull() ? 0 : res[0]["health_score"].as<int>();

            // fetch Aggregated Stats (FIXED WITH JOIN)
            dbClient->execSqlAsync(
                "SELECT "
                "COALESCE(SUM(CASE WHEN fi.health_points > 0 THEN fi.health_points ELSE 0 END), 0) AS healthy_sum, "
                "COALESCE(SUM(CASE WHEN fi.health_points < 0 THEN ABS(fi.health_points) ELSE 0 END), 0) AS unhealthy_sum "
                "FROM food_logs fl "
                "JOIN food_items fi ON fl.food_item_id = fi.id "
                "WHERE fl.user_id = $1",
                [callback, dbClient, userId, user](const drogon::orm::Result& stats) mutable {
                    user["stats"]["healthy"]   = stats[0]["healthy_sum"].as<int>();
                    user["stats"]["unhealthy"] = stats[0]["unhealthy_sum"].as<int>();

                    // fetch Recent Activity (FIXED WITH JOIN)
                    dbClient->execSqlAsync(
                        "SELECT fi.dish_name AS item_name, fi.health_points, fl.logged_at::text "
                        "FROM food_logs fl "
                        "JOIN food_items fi ON fl.food_item_id = fi.id "
                        "WHERE fl.user_id = $1 "
                        "ORDER BY fl.logged_at DESC "
                        "LIMIT 20",
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
                            LOG_ERROR << "Logs Error: " << e.base().what();
                            auto resp = HttpResponse::newHttpResponse();
                            resp->setStatusCode(k500InternalServerError);
                            callback(resp);
                        },
                        userId);
                },
                [callback](const drogon::orm::DrogonDbException& e) {
                    LOG_ERROR << "Stats Error: " << e.base().what();
                    auto resp = HttpResponse::newHttpResponse();
                    resp->setStatusCode(k500InternalServerError);
                    callback(resp);
                },
                userId);
        },
        [callback](const drogon::orm::DrogonDbException& e) {
            LOG_ERROR << "User Error: " << e.base().what();
            auto resp = HttpResponse::newHttpResponse();
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },
        userId);
}

void User::updateOne(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback,
                     std::string&& id) {

    // validation
    if (!isValidId(id)) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }
    auto json = req->getJsonObject();
    if (!json) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    std::string displayName = json->get("display_name", "").asString();
    std::string dietaryPrefs = json->get("dietary_preferences", "").asString();
    std::string phone = json->get("phone", "").asString();

    auto dbClient = app().getDbClient();
    
    // Update SQL to include the phone column
    dbClient->execSqlAsync(
        "UPDATE users SET display_name = $1, dietary_preferences = $2, phone = $3 WHERE id = $4",
        [callback](const drogon::orm::Result& res) {
            Json::Value ret;
            ret["result"] = "updated";
            auto resp = HttpResponse::newHttpJsonResponse(ret);
            resp->setStatusCode(k200OK);
            callback(resp);
        },
        [callback](const drogon::orm::DrogonDbException& e) {
            LOG_ERROR << "Update Error: " << e.base().what();
            auto resp = HttpResponse::newHttpResponse();
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },
        displayName, dietaryPrefs, phone, id);
}

void User::deleteOne(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback,
                     std::string&& id) {

    // validation
    if (!isValidId(id)) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

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

void User::logFood(const HttpRequestPtr& req,
                   std::function<void(const HttpResponsePtr&)>&& callback,
                   std::string&& id) {

    // validation
    if (!isValidId(id)) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }
    
    auto json = req->getJsonObject();
    if (!json || !json->isMember("food_item_id")) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    int foodItemId = (*json)["food_item_id"].asInt();
    std::string userId = id;

    auto dbClient = app().getDbClient();

    try {
        auto trans = dbClient->newTransaction();

        // insert log
        trans->execSqlSync(
            "INSERT INTO food_logs (user_id, food_item_id) VALUES ($1, $2)",
            userId, foodItemId
        );

        // update health score
        trans->execSqlSync(
            "UPDATE users SET health_score = health_score + "
            "COALESCE((SELECT health_points FROM food_items WHERE id = $1), 0) "
            "WHERE id = $2",
            foodItemId, userId
        );

        Json::Value ret;
        ret["result"] = "logged";

        auto resp = HttpResponse::newHttpJsonResponse(ret);
        resp->setStatusCode(k201Created);
        callback(resp);
    }
    catch (const drogon::orm::DrogonDbException& e) {
        LOG_ERROR << "Transaction Error: " << e.base().what();

        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k500InternalServerError);
        callback(resp);
    }
}
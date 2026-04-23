#include "Restaurant.h"

#include <drogon/HttpAppFramework.h>
#include <drogon/HttpResponse.h>
#include <drogon/orm/Mapper.h>

#include "../models/Restaurants.h"

using namespace drogon;
using namespace drogon::orm;

void Restaurant::getRestaurantById(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback,
                               int id) {
    auto dbClient = drogon::app().getDbClient();
    Mapper<drogon_model::biteful::Restaurants> mapper(dbClient);

    // Drogon's Mapper handles the async/sync flow.
    // findByPrimaryKey can throw if not found.
    try {
        auto restaurant = mapper.findByPrimaryKey(id);

        // Use the model's built-in toJson() to avoid manual assignment
        auto resp = HttpResponse::newHttpJsonResponse(restaurant.toJson());
        callback(resp);
    } catch (const UnexpectedRows& e)  // Specifically catch '0 rows found'
    {
        Json::Value error;
        error["error"] = "Restaurant not found";
        auto resp = HttpResponse::newHttpJsonResponse(error);
        resp->setStatusCode(k404NotFound);
        callback(resp);
    } catch (const DrogonDbException& e) {
        LOG_ERROR << "DB Error: " << e.base().what();
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k500InternalServerError);
        callback(resp);
    }
}

void Restaurant::getAllRestaurants(const HttpRequestPtr& req,
                                std::function<void(const HttpResponsePtr&)>&& callback) {
    auto dbClient = drogon::app().getDbClient();

    drogon::orm::Mapper<drogon_model::biteful::Restaurants> mapper(dbClient);

    try {
        std::string zipcode = req->getParameter("zipcode");

        std::vector<drogon_model::biteful::Restaurants> restaurants;
        if (!zipcode.empty()) {
            Criteria criteria(drogon_model::biteful::Restaurants::Cols::_zipcode,
                              CompareOperator::EQ, zipcode);
            restaurants = mapper.findBy(criteria);
        } else {
            restaurants = mapper.findAll();
        }

        LOG_INFO << "Found " << restaurants.size() << " rows in database.";

        Json::Value jsonArray(Json::arrayValue);
        for (const auto& restaurant : restaurants) {
            jsonArray.append(restaurant.toJson());
        }

        auto resp = HttpResponse::newHttpJsonResponse(jsonArray);
        callback(resp);

    } catch (const DrogonDbException& e) {
        LOG_ERROR << "DB Error: " << e.base().what();
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k500InternalServerError);
        callback(resp);
    }
}

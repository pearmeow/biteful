#pragma once
#include <drogon/HttpController.h>

class Restaurant : public drogon::HttpController<Restaurant> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(Restaurant::getRestaurantById, "/restaurants/{id}", drogon::Get);
    ADD_METHOD_TO(Restaurant::getAllRestaurants, "/restaurants", drogon::Get);
    METHOD_LIST_END

    void getRestaurantById(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& callback,
        int id);
    void getAllRestaurants(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& callback);
};
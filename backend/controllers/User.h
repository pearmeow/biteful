#pragma once

#include <drogon/HttpController.h>

#include <functional>
#include <string>

using namespace drogon;

class User : public drogon::HttpController<User> {
public:
    // Define the routes manually to avoid Restful template bugs
    METHOD_LIST_BEGIN
    // POST /users (Sign-up)
    ADD_METHOD_TO(User::create, "/users", Post, "CorsFilter");
    // GET /users/{id}
    ADD_METHOD_TO(User::getOne, "/users/{1}", Get, "CorsFilter");
    // PUT /users/{id}
    ADD_METHOD_TO(User::updateOne, "/users/{1}", Put, "CorsFilter");
    // DELETE /users/{id}
    ADD_METHOD_TO(User::deleteOne, "/users/{1}", Delete, "CorsFilter");
    METHOD_LIST_END

    void create(const drogon::HttpRequestPtr& req, std::function<void(const drogon::HttpResponsePtr&)>&& callback);

    void getOne(const drogon::HttpRequestPtr& req, std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                std::string&& id);

    void updateOne(const drogon::HttpRequestPtr& req,
                   std::function<void(const drogon::HttpResponsePtr&)>&& callback, std::string&& id);

    void deleteOne(const drogon::HttpRequestPtr& req,
                   std::function<void(const drogon::HttpResponsePtr&)>&& callback, std::string&& id);
};

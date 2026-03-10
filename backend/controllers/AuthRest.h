#pragma once

#include <drogon/HttpController.h>

#include "../filters/CorsFilter.h"

using namespace drogon;

class AuthRest : public drogon::HttpController<AuthRest> {
public:
    METHOD_LIST_BEGIN
    // POST /auth/login
    ADD_METHOD_TO(AuthRest::login, "/auth/login", Post, "CorsFilter");
    // POST /auth/logout
    ADD_METHOD_TO(AuthRest::logout, "/auth/logout", Post, "CorsFilter");
    METHOD_LIST_END

    void login(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);

    void logout(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
};

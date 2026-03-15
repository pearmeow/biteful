#pragma once

#include <drogon/HttpController.h>

#include "../filters/CorsFilter.h"

using namespace drogon;

class Auth : public drogon::HttpController<Auth> {
public:
    METHOD_LIST_BEGIN
    // POST /auth
    ADD_METHOD_TO(Auth::login, "/auth", Post, "CorsFilter");
    // DELETE /auth/:session_id
    ADD_METHOD_TO(Auth::logout, "/auth/{1:session_id}", Delete, "CorsFilter", "LoginFilter");
    METHOD_LIST_END

    void login(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);

    void logout(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback,
                const std::string& sessionId);
};

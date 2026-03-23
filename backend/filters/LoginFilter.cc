/**
 *
 *  LoginFilter.cc
 *
 */

#include "LoginFilter.h"

#include <drogon/HttpResponse.h>
// #include <drogon/HttpTypes.h>

using namespace drogon;

void LoginFilter::doFilter(const HttpRequestPtr& req, FilterCallback&& fcb, FilterChainCallback&& fccb) {
    // check if session has a logged in variable and if that variable is true
    if (req->session()->find("loggedIn") && req->session()->get<bool>("loggedIn") != true) {
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setStatusCode(drogon::k400BadRequest);
        fcb(resp);
        return;
    }
    // go to the next one filter/route
    fccb();
    return;
}

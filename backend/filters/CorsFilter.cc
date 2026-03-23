#include "CorsFilter.h"

#include <drogon/HttpResponse.h>

using namespace drogon;

void CorsFilter::doFilter(const HttpRequestPtr& req, FilterCallback&& fcb, FilterChainCallback&& fccb) {
    // 1. Handle OPTIONS (Pre-flight)
    if (req->method() == drogon::Options) {
        auto res = HttpResponse::newHttpResponse();
        res->setStatusCode(k200OK);

        // These allow the browser to proceed with the actual POST/GET
        res->addHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        res->addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        // don't add authorization here because no jwts
        res->addHeader("Access-Control-Allow-Headers", "Content-Type");
        res->addHeader("Access-Control-Allow-Credentials", "true");

        fcb(res);
        return;
    }

    // 2. Allow actual requests to proceed to the next filter or controller
    fccb();
}

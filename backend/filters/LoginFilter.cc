/**
 *
 *  LoginFilter.cc
 *
 */

#include "LoginFilter.h"
#include <drogon/HttpResponse.h>
// #include <drogon/HttpTypes.h>


using namespace drogon;

void LoginFilter::doFilter(const HttpRequestPtr &req,
                         FilterCallback &&fcb,
                         FilterChainCallback &&fccb)
{
    auto token = req->getHeader("Authorization");
    //Edit your logic here
    if (!token.empty())
    {
        //Passed
        fccb();
        return;
    }
    //Check failed
    auto resp = drogon::HttpResponse::newHttpResponse();
    resp->setStatusCode(drogon::k401Unauthorized);
    fcb(resp);
}

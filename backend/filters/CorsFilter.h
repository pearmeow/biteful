#pragma once
#include <drogon/HttpFilter.h>

class CorsFilter : public drogon::HttpFilter<CorsFilter>
{
  public:
    CorsFilter() {}
    void doFilter(const drogon::HttpRequestPtr &req,
                  drogon::FilterCallback &&fcb,
                  drogon::FilterChainCallback &&fccb) override;
};
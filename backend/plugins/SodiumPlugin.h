#pragma once

#include <drogon/plugins/Plugin.h>
#include <sodium.h>
#include <string>

class SodiumPlugin : public drogon::Plugin<SodiumPlugin>
{
  public:
    SodiumPlugin() {}
    
    // Standard Drogon Plugin Lifecycle
    void initAndStart(const Json::Value &config) override;
    void shutdown() override;

    // Hashing Logic
    std::string hashPassword(const std::string &password) const;
    bool verifyPassword(const std::string &password, const std::string &hash) const;

  private:
    // You can pull these from the config file later if needed
    unsigned long long opsLimit_ = crypto_pwhash_OPSLIMIT_INTERACTIVE;
    size_t memLimit_ = crypto_pwhash_MEMLIMIT_INTERACTIVE;
};
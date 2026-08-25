// Copyright (c) OptionC. All rights reserved.

using System.Net.Security;
using System.Security.Cryptography.X509Certificates;

namespace CFR.Base;

/// <summary>
/// SSL certificate validation for YARP reverse proxy in local development only.
/// Accepts valid certificates and localhost/127.0.0.1 dev certificates; rejects others.
/// </summary>
public static class DevReverseProxySslPolicy
{
    public static bool ValidateLocalDevelopmentCertificate(
        object? sender,
        X509Certificate? certificate,
        X509Chain? chain,
        SslPolicyErrors sslPolicyErrors)
    {
        _ = sender;
        _ = chain;
        if (sslPolicyErrors == SslPolicyErrors.None)
        {
            return true;
        }

        if (certificate is X509Certificate2 cert)
        {
            string subject = cert.Subject;
            return subject.Contains("localhost", StringComparison.OrdinalIgnoreCase)
                || subject.Contains("127.0.0.1", StringComparison.OrdinalIgnoreCase);
        }

        return false;
    }
}
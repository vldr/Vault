using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Vault.Objects
{
    public static class SessionExtension
    {
        public static void Set(this ISession session, string key, UserSession value)
        {
            session.SetString(key, JsonConvert.SerializeObject(value));
        }

        public static UserSession Get(this ISession session, string key)
        {
            var value = session.GetString(key);

            return value == null ? null : JsonConvert.DeserializeObject<UserSession>(value);
        }
    }
}

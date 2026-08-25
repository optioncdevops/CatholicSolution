// Copyright (c) OptionC. All rights reserved.

using CFR.Common.MailService;

namespace CFR.Common.Services
{
    public class SISSessionRepository
    {
        public static SettingConfiguration ReadConfiguration(string webRootPath = "")
        {
            if (webRootPath == "")
            {
                webRootPath = AppDomain.CurrentDomain.BaseDirectory.Replace(@"\bin\Debug\net10.0", "");
            }
            string strFileName = string.Concat(webRootPath, @"\_configurationSettings.json");
            // Deserialize
            string fileData = CommonMethods.ReadFile(strFileName);
            return CommonMethods.DeserializeObject<SettingConfiguration>(fileData)
                ?? new SettingConfiguration();
        }

        public static SettingConfiguration ReadData(string webRootPath = "")
        {
            if (webRootPath == "")
            {
                webRootPath = AppDomain.CurrentDomain.BaseDirectory.Replace(@"\bin\Debug\net10.0", "");
            }

            string strFileName = string.Concat(webRootPath, @"\_configurationSettings.json");
            // Deserialize
            string fileData = CommonMethods.ReadFile(strFileName);
            return CommonMethods.DeserializeObject<SettingConfiguration>(fileData)
                ?? new SettingConfiguration();
        }

        public static SettingConfiguration Configuration { get; private set; } = ReadData();
    }
}

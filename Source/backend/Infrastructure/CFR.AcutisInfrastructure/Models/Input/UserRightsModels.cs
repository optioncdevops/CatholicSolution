using System;
using System.Collections.Generic;
using System.Text;

namespace CFR.AcutisInfrastructure.Models.Input
{
    public class MenuSettingsInput
    {
        public string ModuleId { get; set; } = string.Empty;
        public string Alpha { get; set; } = string.Empty;
        public string Beta { get; set; } = string.Empty;
        public string Pilot { get; set; } = string.Empty;
        public string Staging { get; set; } = string.Empty;
        public string Live { get; set; } = string.Empty;
        public string Target { get; set; } = string.Empty;
    }

    public class UserRightsInput
    {
        public int UserId { get; set; }
        public int ModuleId { get; set; }
    }
}
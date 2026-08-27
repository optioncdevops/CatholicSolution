using Microsoft.AspNetCore.Mvc;

namespace CFR.Acutis.Controllers.AcutisAuthentication
{
    public class AcutisLoginController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}

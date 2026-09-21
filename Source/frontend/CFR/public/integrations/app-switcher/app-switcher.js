(function(){var e=document.currentScript?.src??``,t=`cfrsw`,n=`cfr-app-switcher-slot`,r=`/portal/api/v1/CFRLaunch/GetAssignedProducts`,i=4e3,a=4e3,o=[`#4F46E5`,`#059669`,`#DC2626`,`#D97706`,`#0EA5E9`,`#7C3AED`,`#DB2777`,`#0D9488`,`#475569`,`#EA580C`];function s(e,t){let n=0;for(let t=0;t<e.length;t+=1)n=n*31+e.charCodeAt(t)>>>0;return n%t}function c(e){return o[s(String(e.productId||e.name||`app`),o.length)]}function l(){if(!e)return null;try{return new URL(e).origin}catch{return null}}function u(){let e=l();return e?`${e}/apps`:null}function d(e,t){let n=t.trim();return/^https?:\/\//i.test(n)||n.startsWith(`data:`)?n:`${e}${n.startsWith(`/`)?``:`/`}${n}`}function f(e){return!!e&&e.isDeleted!==!0&&e.isActive===!0&&e.hubSection===`your`&&!!(e.baseUrl&&e.baseUrl.trim())}function p(e,t){return{productId:t.productId,name:t.productName,subCategory:(t.subCategoryName??``).trim()||void 0,externalUrl:(t.baseUrl??``).trim(),logoUrl:t.logoUrl&&t.logoUrl.trim()?d(e,t.logoUrl.trim()):void 0}}function m(){let e=l();return e?new Promise(t=>{let n=document.createElement(`iframe`);n.src=`${e}/integrations/app-switcher/session-check.html`,n.style.display=`none`,n.setAttribute(`aria-hidden`,`true`);let r=!1,a=e=>{r||(r=!0,window.removeEventListener(`message`,o),clearTimeout(s),n.remove(),t(e))},o=e=>{if(e.source!==n.contentWindow)return;let t=e.data;!t||t.source!==`cfr-app-switcher`||a(t.loggedIn?t.token:null)},s=setTimeout(()=>a(null),i);window.addEventListener(`message`,o),document.body.appendChild(n)}):Promise.resolve(null)}function h(){if(document.getElementById(`${t}-styles`))return;let e=document.createElement(`style`);e.id=`${t}-styles`,e.textContent=`
    .${t}-fixed { position: fixed; top: 16px; right: 16px; z-index: 2147483000; }
    .${t}-inline { position: relative; display: inline-flex; height: 100%; align-items: center; }
    .${t}-wrap { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
    .${t}-btn {
      width: 40px; height: 40px; border-radius: 999px; border: none; cursor: pointer;
      background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); display: grid;
      grid-template-columns: repeat(3, 1fr); gap: 3px; place-items: center; padding: 10px;
    }
    .${t}-btn:hover { background: #f3f4f6; }
    .${t}-dot { width: 4px; height: 4px; border-radius: 50%; background: #44546a; }
    .${t}-btn.${t}-btn-inline {
      width: auto; height: 100%; padding: 0 2px; background: transparent; box-shadow: none;
      grid-template-columns: repeat(3, 1fr); gap: 2.5px;
    }
    .${t}-btn.${t}-btn-inline:hover { background: transparent; opacity: 0.8; }
    .${t}-btn.${t}-btn-inline .${t}-dot {
      width: 3px; height: 3px; background: currentColor;
    }

    .${t}-panel {
      position: absolute; top: 48px; right: 0; width: min(380px, calc(100vw - 24px));
      max-height: 520px; overflow-y: auto; background: #ffffff; border-radius: 16px;
      box-shadow: 0 20px 45px rgba(15,23,42,0.22), 0 2px 8px rgba(15,23,42,0.08);
      display: none; z-index: 2147483001; color: #0f172a;
    }
    .${t}-wrap.${t}-inline .${t}-panel { top: 100%; margin-top: 10px; }
    .${t}-panel.${t}-open { display: block; }

    .${t}-header { padding: 16px 18px 14px; }
    .${t}-header-row {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
    }
    .${t}-header-title { font-size: 15px; font-weight: 700; color: #0f172a; }
    .${t}-header-badge {
      min-width: 20px; height: 20px; padding: 0 6px; border-radius: 999px; background: #eef2ff;
      color: #4338ca; font-size: 11px; font-weight: 700; display: flex; align-items: center;
      justify-content: center;
    }
    .${t}-header-sub { font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 2px; }
    .${t}-header-desc { font-size: 11.5px; color: #64748b; line-height: 1.4; }

    .${t}-divider { border-top: 1px solid #eef0f3; }

    .${t}-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 10px;
    }
    .${t}-tile {
      display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px;
      padding: 10px 6px; border-radius: 12px; cursor: pointer; text-decoration: none; color: inherit;
      transition: background-color 120ms ease;
    }
    .${t}-tile:hover, .${t}-tile:focus-visible { background: #f3f4f6; outline: none; }
    .${t}-tile-icon {
      width: 40px; height: 40px; border-radius: 11px; object-fit: cover; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700;
      color: #ffffff;
    }
    .${t}-tile-name {
      font-size: 12px; font-weight: 600; color: #0f172a; line-height: 1.25;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .${t}-tile-sub {
      font-size: 10.5px; color: #8a94a6; line-height: 1.2;
      display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
    }

    .${t}-footer {
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      padding: 12px 18px; font-size: 12.5px; font-weight: 600; color: #1f2937;
      cursor: pointer; text-decoration: none;
    }
    .${t}-footer:hover { background: #f8fafc; }
    .${t}-footer-chevron { font-size: 14px; color: #94a3b8; }

    .${t}-empty, .${t}-error {
      grid-column: 1 / -1; padding: 18px 10px; font-size: 12px; color: #6b7280; text-align: center;
    }
  `,document.head.appendChild(e)}function g(e){let n=(e.name||`?`).trim(),r=c(e);if(e.logoUrl){let i=document.createElement(`img`);return i.className=`${t}-tile-icon`,i.style.background=r,i.src=e.logoUrl,i.alt=n,i.onerror=()=>{i.replaceWith(_(n,r))},i}return _(n,r)}function _(e,n){let r=document.createElement(`span`);return r.className=`${t}-tile-icon`,r.style.background=n,r.textContent=(e[0]??`?`).toUpperCase(),r}function v(e){e.externalUrl&&window.open(e.externalUrl,`_blank`,`noopener,noreferrer`)}async function y(e,t){let n=await fetch(`${e}${r}`,{method:`GET`,headers:{Accept:`application/json`,Authorization:`Bearer ${t}`}});if(!n.ok)throw Error(`GetAssignedProducts failed with status ${n.status}`);let i=await n.json();return(Array.isArray(i.resultData)?i.resultData:[]).filter(f).map(t=>p(e,t))}function b(){let e=document.createElement(`div`);e.className=`${t}-header`;let n=document.createElement(`div`);n.className=`${t}-header-row`;let r=document.createElement(`span`);r.className=`${t}-header-title`,r.textContent=`Switch app`;let i=document.createElement(`span`);i.className=`${t}-header-badge`,n.appendChild(r),n.appendChild(i);let a=document.createElement(`div`);a.className=`${t}-header-sub`,a.textContent=`Jump to another app`;let o=document.createElement(`div`);return o.className=`${t}-header-desc`,o.textContent=`Open Catholic Solutions and approved connected apps`,e.appendChild(n),e.appendChild(a),e.appendChild(o),{header:e,setCount:e=>{i.textContent=String(e)}}}function x(){let e=u();if(!e)return null;let n=document.createElement(`a`);n.className=`${t}-footer ${t}-divider`,n.href=e,n.target=`_blank`,n.rel=`noopener noreferrer`;let r=document.createElement(`span`);r.textContent=`All apps in App Hub`;let i=document.createElement(`span`);return i.className=`${t}-footer-chevron`,i.textContent=`›`,i.setAttribute(`aria-hidden`,`true`),n.appendChild(r),n.appendChild(i),n}function S(e,n){let r=document.createElement(`div`);r.className=`${t}-panel`;let{header:i,setCount:a}=b();r.appendChild(i);let o=document.createElement(`div`);o.className=`${t}-grid ${t}-divider`,r.appendChild(o);let s=x();return s&&r.appendChild(s),y(e,n).then(e=>{if(o.innerHTML=``,a(e.length),e.length===0){let e=document.createElement(`div`);e.className=`${t}-empty`,e.textContent=`No apps available.`,o.appendChild(e);return}e.forEach(e=>{let n=document.createElement(`a`);n.className=`${t}-tile`,n.href=e.externalUrl,n.rel=`noopener noreferrer`,n.target=`_blank`,n.addEventListener(`click`,t=>{t.preventDefault(),v(e)}),n.appendChild(g(e));let r=document.createElement(`span`);if(r.className=`${t}-tile-name`,r.textContent=e.name,n.appendChild(r),e.subCategory){let r=document.createElement(`span`);r.className=`${t}-tile-sub`,r.textContent=e.subCategory,n.appendChild(r)}o.appendChild(n)})}).catch(()=>{o.innerHTML=``,a(0);let e=document.createElement(`div`);e.className=`${t}-error`,e.textContent=`Unable to load apps right now.`,o.appendChild(e)}),r}function C(e,n,r,i){h();let a=document.createElement(`div`);a.className=`${t}-wrap ${i?`${t}-inline`:`${t}-fixed`}`;let o=document.createElement(`button`);o.type=`button`,o.className=`${t}-btn${i?` ${t}-btn-inline`:``}`,o.setAttribute(`aria-label`,`Open Catholic Solutions app switcher`);for(let e=0;e<9;e+=1){let e=document.createElement(`span`);e.className=`${t}-dot`,o.appendChild(e)}let s=S(e,n);o.addEventListener(`click`,e=>{e.stopPropagation(),s.classList.toggle(`${t}-open`)}),document.addEventListener(`click`,e=>{a.contains(e.target)||s.classList.remove(`${t}-open`)}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&s.classList.remove(`${t}-open`)}),a.appendChild(o),a.appendChild(s),r.appendChild(a)}function w(e=a){return new Promise(t=>{let r=document.getElementById(n);if(r){t(r);return}let i=setTimeout(()=>{a.disconnect(),t(null)},e),a=new MutationObserver(()=>{let e=document.getElementById(n);e&&(clearTimeout(i),a.disconnect(),t(e))});a.observe(document.body,{childList:!0,subtree:!0})})}async function T(){let e=await m();if(!e)return;let t=await w();if(t){C(`https://localhost:5050`,e,t,!0);return}C(`https://localhost:5050`,e,document.body,!1)}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,()=>void T()):T()})();
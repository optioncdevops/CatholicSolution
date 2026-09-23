(function(){var e=document.currentScript,t=e?.src??``,n=(e?.dataset.cfrDatasyncBaseUrl??``).replace(/\/+$/,``),r=e?.dataset.cfrDatasyncClientId??``,i=e?.dataset.cfrDatasyncClientSecret??``,a=e?.dataset.cfrCurrentProductId??``,o=`cfrsw`,s=`cfr-app-switcher-slot`,c=`/acutis/api/v1/Products/GetProducts`,l=`/acutis/Acutis/Attachment/Products/`,u=`/api/v1/Auth/Login`,d=`/api/v1/Products/GetUserProducts`,f=`/api/v1/Products/LaunchProduct`,p=`cfrEmail`,m=4e3,h=[`#4F46E5`,`#059669`,`#DC2626`,`#D97706`,`#0EA5E9`,`#7C3AED`,`#DB2777`,`#0D9488`,`#475569`,`#EA580C`];function g(e,t){let n=0;for(let t=0;t<e.length;t+=1)n=n*31+e.charCodeAt(t)>>>0;return n%t}function _(e){return h[g(String(e.productId||e.name||`app`),h.length)]}function v(){if(!t)return null;try{return new URL(t).origin}catch{return null}}function y(e,t){return`${e}${l}${t.replace(/\\/g,`/`).split(`/`).filter(Boolean).pop()??``}`}function b(e){return!!e&&e.isDeleted!==!0&&e.isActive===!0&&e.productStatus===1&&!!(e.externalPageUrl&&e.externalPageUrl.trim())}function x(e){return!!e&&!!(e.externalPageUrl&&e.externalPageUrl.trim())}function S(e){return{productId:e.productId,name:e.shortName||e.productName,subCategory:(e.subCategoryName??``).trim()||void 0,externalUrl:(e.externalPageUrl??``).trim(),logoUrl:e.logoName&&e.logoName.trim()?y(`https://localhost:5050`,e.logoName.trim()):void 0,navigationTarget:e.navigationTarget}}function C(){if(document.getElementById(`${o}-styles`))return;let e=document.createElement(`style`);e.id=`${o}-styles`,e.textContent=`
    .${o}-fixed { position: fixed; top: 16px; right: 16px; z-index: 2147483000; }
    .${o}-inline { position: relative; display: inline-flex; height: 100%; align-items: center; }
    .${o}-wrap { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
    .${o}-btn {
      width: 40px; height: 40px; border-radius: 999px; border: none; cursor: pointer;
      background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); display: grid;
      grid-template-columns: repeat(3, 1fr); gap: 3px; place-items: center; padding: 10px;
    }
    .${o}-btn:hover { background: #f3f4f6; }
    .${o}-dot { width: 4px; height: 4px; border-radius: 50%; background: #44546a; }
    .${o}-btn.${o}-btn-inline {
      width: auto; height: 100%; padding: 0 2px; background: transparent; box-shadow: none;
      grid-template-columns: repeat(3, 1fr); gap: 2.5px;
    }
    .${o}-btn.${o}-btn-inline:hover { background: transparent; opacity: 0.8; }
    .${o}-btn.${o}-btn-inline .${o}-dot {
      width: 3px; height: 3px; background: currentColor;
    }

    .${o}-panel {
      position: absolute; top: 48px; right: 0; width: min(380px, calc(100vw - 24px));
      max-height: 520px; overflow-y: auto; background: #ffffff; border-radius: 16px;
      box-shadow: 0 20px 45px rgba(15,23,42,0.22), 0 2px 8px rgba(15,23,42,0.08);
      display: none; z-index: 2147483001; color: #0f172a;
    }
    .${o}-wrap.${o}-inline .${o}-panel { top: 100%; margin-top: 10px; }
    .${o}-panel.${o}-open { display: block; }

    .${o}-header { padding: 16px 18px 14px; }
    .${o}-header-row {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
    }
    .${o}-header-title { font-size: 15px; font-weight: 700; color: #0f172a; }
    .${o}-header-badge {
      min-width: 20px; height: 20px; padding: 0 6px; border-radius: 999px; background: #eef2ff;
      color: #4338ca; font-size: 11px; font-weight: 700; display: flex; align-items: center;
      justify-content: center;
    }
    .${o}-header-sub { font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 2px; }
    .${o}-header-desc { font-size: 11.5px; color: #64748b; line-height: 1.4; }

    .${o}-divider { border-top: 1px solid #eef0f3; }

    .${o}-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 10px;
    }
    .${o}-tile {
      display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px;
      padding: 10px 6px; border-radius: 12px; cursor: pointer; text-decoration: none; color: inherit;
      transition: background-color 120ms ease;
    }
    .${o}-tile:hover, .${o}-tile:focus-visible { background: #f3f4f6; outline: none; }
    .${o}-tile-current { cursor: default; opacity: 0.55; }
    .${o}-tile-current:hover, .${o}-tile-current:focus-visible { background: transparent; }
    .${o}-tile-icon {
      width: 40px; height: 40px; border-radius: 11px; object-fit: cover; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700;
      color: #ffffff;
    }
    .${o}-tile-name {
      font-size: 12px; font-weight: 600; color: #0f172a; line-height: 1.25;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .${o}-tile-sub {
      font-size: 10.5px; color: #8a94a6; line-height: 1.2;
      display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
    }

    .${o}-footer {
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      padding: 12px 18px; font-size: 12.5px; font-weight: 600; color: #1f2937;
      cursor: pointer; text-decoration: none;
    }
    .${o}-footer:hover { background: #f8fafc; }
    .${o}-footer-chevron { font-size: 14px; color: #94a3b8; }

    .${o}-empty, .${o}-error {
      grid-column: 1 / -1; padding: 18px 10px; font-size: 12px; color: #6b7280; text-align: center;
    }
  `,document.head.appendChild(e)}function w(e){let t=(e.name||`?`).trim(),n=_(e);if(e.logoUrl){let r=document.createElement(`img`);return r.className=`${o}-tile-icon`,r.style.background=n,r.src=e.logoUrl,r.alt=t,r.onerror=()=>{r.replaceWith(T(t,n))},r}return T(t,n)}function T(e,t){let n=document.createElement(`span`);return n.className=`${o}-tile-icon`,n.style.background=t,n.textContent=(e[0]??`?`).toUpperCase(),n}async function E(e){let t=k(p);if(!t)return null;try{let a=await A(n,r,i);if(!a)return null;let o=await fetch(`${n}${f}`,{method:`POST`,headers:{"Content-Type":`application/json`,Accept:`application/json`,Authorization:`Bearer ${a}`},body:JSON.stringify({email:t,productId:e})});return o.ok?(await o.json()).resultData?.launchUrl??null:null}catch{return null}}async function D(e){if(!e.externalUrl)return;let t=e.externalUrl;n&&r&&i&&(t=await E(e.productId)??e.externalUrl),e.navigationTarget===`new-tab`?window.open(t,`_blank`,`noopener,noreferrer`):window.location.assign(t)}async function O(e){let t=await fetch(`${e}${c}`,{method:`GET`,headers:{Accept:`application/json`}});if(!t.ok)throw Error(`GetProducts failed with status ${t.status}`);let n=await t.json();return(Array.isArray(n.resultData)?n.resultData:[]).filter(b).map(S)}function k(e){try{return sessionStorage.getItem(e)??``}catch{return``}}async function A(e,t,n){let r=await fetch(`${e}${u}`,{method:`POST`,headers:{"Content-Type":`application/json`,Accept:`application/json`},body:JSON.stringify({clientId:t,clientSecret:n})});return r.ok?(await r.json()).resultData?.accessToken??``:``}async function j(){let e=k(p);if(!e)return null;try{let t=await A(n,r,i);if(!t)return null;let a=await fetch(`${n}${d}?email=${encodeURIComponent(e)}`,{method:`GET`,headers:{Accept:`application/json`,Authorization:`Bearer ${t}`}});if(!a.ok)return null;let o=await a.json();return{apps:(Array.isArray(o.resultData?.products)?o.resultData.products:[]).filter(x).map(S),platformLaunchCode:o.resultData?.platformLaunchCode??null}}catch{return null}}function M(){let e=document.createElement(`div`);e.className=`${o}-header`;let t=document.createElement(`div`);t.className=`${o}-header-row`;let n=document.createElement(`span`);n.className=`${o}-header-title`,n.textContent=`Switch app`;let r=document.createElement(`span`);r.className=`${o}-header-badge`,t.appendChild(n),t.appendChild(r);let i=document.createElement(`div`);i.className=`${o}-header-sub`,i.textContent=`Jump to another app`;let a=document.createElement(`div`);return a.className=`${o}-header-desc`,a.textContent=`Open Catholic Solutions and approved connected apps`,e.appendChild(t),e.appendChild(i),e.appendChild(a),{header:e,setCount:e=>{r.textContent=String(e)}}}function N(e){let t=v();if(!t)return null;let n=e?`${t}/apps?code=${encodeURIComponent(e)}`:`${t}/apps`,r=document.createElement(`a`);r.className=`${o}-footer ${o}-divider`,r.href=n,r.target=`_blank`,r.rel=`noopener noreferrer`;let i=document.createElement(`span`);i.textContent=`All apps in App Hub`;let a=document.createElement(`span`);return a.className=`${o}-footer-chevron`,a.textContent=`›`,a.setAttribute(`aria-hidden`,`true`),r.appendChild(i),r.appendChild(a),r}function P(e,t){let n=document.createElement(`div`);n.className=`${o}-panel`;let{header:r,setCount:i}=M();n.appendChild(r);let s=document.createElement(`div`);s.className=`${o}-grid ${o}-divider`,n.appendChild(s);let c=N(t);return c&&n.appendChild(c),e.then(e=>{if(s.innerHTML=``,i(e.length),e.length===0){let e=document.createElement(`div`);e.className=`${o}-empty`,e.textContent=`No apps available.`,s.appendChild(e);return}e.forEach(e=>{let t=a!==``&&String(e.productId)===a,n=document.createElement(`a`);n.className=`${o}-tile${t?` ${o}-tile-current`:``}`,n.rel=`noopener noreferrer`,t?n.setAttribute(`aria-disabled`,`true`):(n.href=e.externalUrl,n.addEventListener(`click`,t=>{t.preventDefault(),D(e)})),n.appendChild(w(e));let r=document.createElement(`span`);if(r.className=`${o}-tile-name`,r.textContent=e.name,n.appendChild(r),t){let e=document.createElement(`span`);e.className=`${o}-tile-sub`,e.textContent=`Current app`,n.appendChild(e)}else if(e.subCategory){let t=document.createElement(`span`);t.className=`${o}-tile-sub`,t.textContent=e.subCategory,n.appendChild(t)}s.appendChild(n)})}).catch(()=>{s.innerHTML=``,i(0);let e=document.createElement(`div`);e.className=`${o}-error`,e.textContent=`Unable to load apps right now.`,s.appendChild(e)}),n}function F(e,t,n,r){C();let i=document.createElement(`div`);i.className=`${o}-wrap ${n?`${o}-inline`:`${o}-fixed`}`;let a=document.createElement(`button`);a.type=`button`,a.className=`${o}-btn${n?` ${o}-btn-inline`:``}`,a.setAttribute(`aria-label`,`Open Catholic Solutions app switcher`);for(let e=0;e<9;e+=1){let e=document.createElement(`span`);e.className=`${o}-dot`,a.appendChild(e)}let s=P(e,r);a.addEventListener(`click`,e=>{e.stopPropagation(),s.classList.toggle(`${o}-open`)}),document.addEventListener(`click`,e=>{i.contains(e.target)||s.classList.remove(`${o}-open`)}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&s.classList.remove(`${o}-open`)}),i.appendChild(a),i.appendChild(s),t.appendChild(i)}function I(e=m){return new Promise(t=>{let n=document.getElementById(s);if(n){t(n);return}let r=setTimeout(()=>{i.disconnect(),t(null)},e),i=new MutationObserver(()=>{let e=document.getElementById(s);e&&(clearTimeout(r),i.disconnect(),t(e))});i.observe(document.body,{childList:!0,subtree:!0})})}async function L(){if(n&&r&&i){let e=await j();if(e===null)return;let t=await I();F(Promise.resolve(e.apps),t??document.body,!!t,e.platformLaunchCode);return}let e=await I();if(e){F(O(`https://localhost:5050`),e,!0);return}F(O(`https://localhost:5050`),document.body,!1)}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,()=>void L()):L()})();
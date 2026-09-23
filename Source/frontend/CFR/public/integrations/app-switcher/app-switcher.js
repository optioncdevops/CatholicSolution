(function(){var e=document.currentScript,t=e?.src??``,n=(e?.dataset.cfrDatasyncBaseUrl??``).replace(/\/+$/,``),r=e?.dataset.cfrDatasyncClientId??``,i=e?.dataset.cfrDatasyncClientSecret??``,a=e?.dataset.cfrCurrentProductId??``,o=(e?.dataset.cfrGatewayOrigin??``).replace(/\/+$/,``),s=`cfrsw`,c=`cfr-app-switcher-slot`,l=`/acutis/api/v1/Products/GetProducts`,u=`/acutis/Acutis/Attachment/Products/`,d=`/api/v1/Auth/Login`,f=`/api/v1/Products/GetUserProducts`,p=`cfrEmail`,m=`cfrswDataSyncToken`,h=4e3,g=[`#4F46E5`,`#059669`,`#DC2626`,`#D97706`,`#0EA5E9`,`#7C3AED`,`#DB2777`,`#0D9488`,`#475569`,`#EA580C`];function _(e,t){let n=0;for(let t=0;t<e.length;t+=1)n=n*31+e.charCodeAt(t)>>>0;return n%t}function v(e){return g[_(String(e.productId||e.name||`app`),g.length)]}function y(){if(!t)return null;try{return new URL(t).origin}catch{return null}}function b(e,t){return`${e}${u}${t.replace(/\\/g,`/`).split(`/`).filter(Boolean).pop()??``}`}function x(e){return!!e&&e.isDeleted!==!0&&e.isActive===!0&&e.productStatus===1&&!!(e.externalPageUrl&&e.externalPageUrl.trim())}function S(e){return!!e&&!!(e.externalPageUrl&&e.externalPageUrl.trim())}function C(e){return{productId:e.productId,name:e.shortName||e.productName,subCategory:(e.subCategoryName??``).trim()||void 0,externalUrl:(e.externalPageUrl??``).trim(),logoUrl:e.logoName&&e.logoName.trim()?b(o,e.logoName.trim()):void 0,navigationTarget:e.navigationTarget}}function w(e){try{return sessionStorage.getItem(e)??``}catch{return``}}function T(){try{return sessionStorage.getItem(`cfrswDataSyncToken`)??``}catch{return``}}function E(e){try{sessionStorage.setItem(m,e)}catch{}}function D(){try{sessionStorage.removeItem(m)}catch{}}async function O(e,t,n){let r=await fetch(`${e}${d}`,{method:`POST`,headers:{"Content-Type":`application/json`,Accept:`application/json`},body:JSON.stringify({clientId:t,clientSecret:n})});return r.ok?(await r.json()).resultData?.accessToken??``:``}async function k(e,t,n,r){let i=T();if(!i){if(i=await O(e,t,n),!i)return null;E(i)}let a=await r(i);if(a.status===401){if(D(),i=await O(e,t,n),!i)return null;E(i),a=await r(i)}return a.ok?await a.json():null}async function A(e,t,n,r){try{let i=await k(e,t,n,t=>fetch(`${e}${f}?email=${encodeURIComponent(r)}`,{method:`GET`,headers:{Accept:`application/json`,Authorization:`Bearer ${t}`}}));return i?{apps:(Array.isArray(i.resultData?.products)?i.resultData.products:[]).filter(S).map(C),platformLaunchCode:i.resultData?.platformLaunchCode??null}:null}catch{return null}}async function j(e,t,n,r,i){try{return(await k(e,t,n,t=>fetch(`${e}/api/v1/Products/LaunchProduct`,{method:`POST`,headers:{"Content-Type":`application/json`,Accept:`application/json`,Authorization:`Bearer ${t}`},body:JSON.stringify({email:r,productId:i})})))?.resultData?.launchUrl??null}catch{return null}}async function M(e){let t=await fetch(`${e}${l}`,{method:`GET`,headers:{Accept:`application/json`}});if(!t.ok)throw Error(`GetProducts failed with status ${t.status}`);let n=await t.json();return(Array.isArray(n.resultData)?n.resultData:[]).filter(x).map(C)}function N(){if(document.getElementById(`cfrsw-styles`))return;let e=document.createElement(`style`);e.id=`${s}-styles`,e.textContent=`
    .${s}-fixed { position: fixed; top: 16px; right: 16px; z-index: 2147483000; }
    .${s}-inline { position: relative; display: inline-flex; height: 100%; align-items: center; }
    .${s}-wrap { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
    .${s}-btn {
      width: 40px; height: 40px; border-radius: 999px; border: none; cursor: pointer;
      background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); display: grid;
      grid-template-columns: repeat(3, 1fr); gap: 3px; place-items: center; padding: 10px;
    }
    .${s}-btn:hover { background: #f3f4f6; }
    .${s}-dot { width: 4px; height: 4px; border-radius: 50%; background: #44546a; }
    .${s}-btn.${s}-btn-inline {
      width: auto; height: 100%; padding: 0 2px; background: transparent; box-shadow: none;
      grid-template-columns: repeat(3, 1fr); gap: 2.5px;
    }
    .${s}-btn.${s}-btn-inline:hover { background: transparent; opacity: 0.8; }
    .${s}-btn.${s}-btn-inline .${s}-dot {
      width: 3px; height: 3px; background: currentColor;
    }

    .${s}-panel {
      position: absolute; top: 48px; right: 0; width: min(380px, calc(100vw - 24px));
      max-height: 520px; overflow-y: auto; background: #ffffff; border-radius: 16px;
      box-shadow: 0 20px 45px rgba(15,23,42,0.22), 0 2px 8px rgba(15,23,42,0.08);
      display: none; z-index: 2147483001; color: #0f172a;
    }
    .${s}-wrap.${s}-inline .${s}-panel { top: 100%; margin-top: 10px; }
    .${s}-panel.${s}-open { display: block; }

    .${s}-header { padding: 16px 18px 14px; }
    .${s}-header-row {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
    }
    .${s}-header-title { font-size: 15px; font-weight: 700; color: #0f172a; }
    .${s}-header-badge {
      min-width: 20px; height: 20px; padding: 0 6px; border-radius: 999px; background: #eef2ff;
      color: #4338ca; font-size: 11px; font-weight: 700; display: flex; align-items: center;
      justify-content: center;
    }
    .${s}-header-sub { font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 2px; }
    .${s}-header-desc { font-size: 11.5px; color: #64748b; line-height: 1.4; }

    .${s}-divider { border-top: 1px solid #eef0f3; }

    .${s}-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 10px;
    }
    .${s}-tile {
      display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px;
      padding: 10px 6px; border-radius: 12px; cursor: pointer; text-decoration: none; color: inherit;
      transition: background-color 120ms ease;
    }
    .${s}-tile:hover, .${s}-tile:focus-visible { background: #f3f4f6; outline: none; }
    .${s}-tile-current { cursor: default; opacity: 0.55; }
    .${s}-tile-current:hover, .${s}-tile-current:focus-visible { background: transparent; }
    .${s}-tile-icon {
      width: 40px; height: 40px; border-radius: 11px; object-fit: cover; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700;
      color: #ffffff;
    }
    .${s}-tile-name {
      font-size: 12px; font-weight: 600; color: #0f172a; line-height: 1.25;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .${s}-tile-sub {
      font-size: 10.5px; color: #8a94a6; line-height: 1.2;
      display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
    }

    .${s}-footer {
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      padding: 12px 18px; font-size: 12.5px; font-weight: 600; color: #1f2937;
      cursor: pointer; text-decoration: none;
    }
    .${s}-footer:hover { background: #f8fafc; }
    .${s}-footer-chevron { font-size: 14px; color: #94a3b8; }

    .${s}-empty, .${s}-error {
      grid-column: 1 / -1; padding: 18px 10px; font-size: 12px; color: #6b7280; text-align: center;
    }
  `,document.head.appendChild(e)}function P(e){let t=(e.name||`?`).trim(),n=v(e);if(e.logoUrl){let r=document.createElement(`img`);return r.className=`${s}-tile-icon`,r.style.background=n,r.src=e.logoUrl,r.alt=t,r.onerror=()=>{r.replaceWith(F(t,n))},r}return F(t,n)}function F(e,t){let n=document.createElement(`span`);return n.className=`${s}-tile-icon`,n.style.background=t,n.textContent=(e[0]??`?`).toUpperCase(),n}async function I(e){if(!e.externalUrl)return;let t=e.externalUrl;if(n&&r&&i){let a=w(p);a&&(t=await j(n,r,i,a,e.productId)??e.externalUrl)}e.navigationTarget===`new-tab`?window.open(t,`_blank`,`noopener,noreferrer`):window.location.assign(t)}function L(){let e=document.createElement(`div`);e.className=`${s}-header`;let t=document.createElement(`div`);t.className=`${s}-header-row`;let n=document.createElement(`span`);n.className=`${s}-header-title`,n.textContent=`Switch app`;let r=document.createElement(`span`);r.className=`${s}-header-badge`,t.appendChild(n),t.appendChild(r);let i=document.createElement(`div`);i.className=`${s}-header-sub`,i.textContent=`Jump to another app`;let a=document.createElement(`div`);return a.className=`${s}-header-desc`,a.textContent=`Open Catholic Solutions and approved connected apps`,e.appendChild(t),e.appendChild(i),e.appendChild(a),{header:e,setCount:e=>{r.textContent=String(e)}}}function R(e){let t=y();if(!t)return null;let n=e?`${t}/apps?code=${encodeURIComponent(e)}`:`${t}/apps`,r=document.createElement(`a`);r.className=`${s}-footer ${s}-divider`,r.href=n,r.target=`_blank`,r.rel=`noopener noreferrer`;let i=document.createElement(`span`);i.textContent=`All apps in App Hub`;let a=document.createElement(`span`);return a.className=`${s}-footer-chevron`,a.textContent=`›`,a.setAttribute(`aria-hidden`,`true`),r.appendChild(i),r.appendChild(a),r}function z(e,t){let n=document.createElement(`div`);n.className=`${s}-panel`;let{header:r,setCount:i}=L();n.appendChild(r);let o=document.createElement(`div`);o.className=`${s}-grid ${s}-divider`,n.appendChild(o);let c=R(t);return c&&n.appendChild(c),e.then(e=>{if(o.innerHTML=``,i(e.length),e.length===0){let e=document.createElement(`div`);e.className=`${s}-empty`,e.textContent=`No apps available.`,o.appendChild(e);return}e.forEach(e=>{let t=a!==``&&String(e.productId)===a,n=document.createElement(`a`);n.className=`${s}-tile${t?` ${s}-tile-current`:``}`,n.rel=`noopener noreferrer`,t?n.setAttribute(`aria-disabled`,`true`):(n.href=e.externalUrl,n.addEventListener(`click`,t=>{t.preventDefault(),I(e)})),n.appendChild(P(e));let r=document.createElement(`span`);if(r.className=`${s}-tile-name`,r.textContent=e.name,n.appendChild(r),t){let e=document.createElement(`span`);e.className=`${s}-tile-sub`,e.textContent=`Current app`,n.appendChild(e)}else if(e.subCategory){let t=document.createElement(`span`);t.className=`${s}-tile-sub`,t.textContent=e.subCategory,n.appendChild(t)}o.appendChild(n)})}).catch(()=>{o.innerHTML=``,i(0);let e=document.createElement(`div`);e.className=`${s}-error`,e.textContent=`Unable to load apps right now.`,o.appendChild(e)}),n}function B(e,t,n,r){N();let i=document.createElement(`div`);i.className=`${s}-wrap ${n?`${s}-inline`:`${s}-fixed`}`;let a=document.createElement(`button`);a.type=`button`,a.className=`${s}-btn${n?` ${s}-btn-inline`:``}`,a.setAttribute(`aria-label`,`Open Catholic Solutions app switcher`);for(let e=0;e<9;e+=1){let e=document.createElement(`span`);e.className=`${s}-dot`,a.appendChild(e)}let o=z(e,r);a.addEventListener(`click`,e=>{e.stopPropagation(),o.classList.toggle(`${s}-open`)}),document.addEventListener(`click`,e=>{i.contains(e.target)||o.classList.remove(`${s}-open`)}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&o.classList.remove(`${s}-open`)}),i.appendChild(a),i.appendChild(o),t.appendChild(i)}function V(e=h){return new Promise(t=>{let n=document.getElementById(c);if(n){t(n);return}let r=setTimeout(()=>{i.disconnect(),t(null)},e),i=new MutationObserver(()=>{let e=document.getElementById(c);e&&(clearTimeout(r),i.disconnect(),t(e))});i.observe(document.body,{childList:!0,subtree:!0})})}async function H(){if(n&&r&&i){let e=w(p);if(!e)return;let[t,a]=await Promise.all([A(n,r,i,e),V()]);if(t===null)return;B(Promise.resolve(t.apps),a??document.body,!!a,t.platformLaunchCode);return}if(!o){console.error(`[app-switcher] Default mode needs data-cfr-gateway-origin on the script tag.`);return}let e=await V();if(e){B(M(o),e,!0);return}B(M(o),document.body,!1)}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,()=>void H()):H()})();
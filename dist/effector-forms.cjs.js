"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("effector"),r=require("effector-react");const t={store:function({init:r,domain:t,existing:o}){return o||(t?t.store(r):e.createStore(r))},event:function({domain:r,existing:t}){return t||(r?r.event():e.createEvent())}};function o(e,r,o){var i,n,s,u,l,a,d,c,m,v,f;const h="function"==typeof r.init?r.init():r.init,g=t.store({domain:o,existing:null===(i=r.units)||void 0===i?void 0:i.$value,init:h}),p=t.store({domain:o,existing:null===(n=r.units)||void 0===n?void 0:n.$errors,init:[]}),E=p.map(e=>e[0]?e[0]:null),x=g.map(e=>e!==h),$=t.store({domain:o,existing:null===(s=r.units)||void 0===s?void 0:s.$isTouched,init:!1}),V=t.event({domain:o,existing:null===(u=r.units)||void 0===u?void 0:u.onChange}),b=t.event({domain:o,existing:null===(l=r.units)||void 0===l?void 0:l.onBlur}),y=t.event({domain:o,existing:null===(a=r.units)||void 0===a?void 0:a.changed}),S=t.event({domain:o,existing:null===(d=r.units)||void 0===d?void 0:d.addError}),T=t.event({domain:o,existing:null===(c=r.units)||void 0===c?void 0:c.validate}),F=t.event({domain:o,existing:null===(m=r.units)||void 0===m?void 0:m.resetErrors}),O=t.event({domain:o,existing:null===(v=r.units)||void 0===v?void 0:v.resetValue}),B=t.event({domain:o,existing:null===(f=r.units)||void 0===f?void 0:f.reset});return{changed:y,name:e,$value:g,$errors:p,$firstError:E,$isValid:E.map(e=>null===e),$isDirty:x,$isTouched:$,$touched:$,onChange:V,onBlur:b,addError:S,validate:T,set:V,reset:B,resetErrors:F,resetValue:O,filter:r.filter}}function i({$form:r,validateFormEvent:t,submitEvent:o,resetFormEvent:i,resetValues:n,field:s,rules:u,resetErrors:l,formValidationEvents:a,fieldValidationEvents:d}){const{$value:c,$errors:m,onBlur:v,changed:f,addError:h,validate:g,resetErrors:p,resetValue:E,reset:x}=s,$="function"==typeof u?e.createStore([]):e.combine(u.map(({source:r})=>r||e.createStore(null))),V=(b=u,(e,r,t)=>{const o=[],i="function"==typeof b?b(e,r):b;for(let n=0;n<i.length;n++){const s=i[n],u=t?t[n]:null,l=s.validator(e,r,u);"boolean"!=typeof l||l||o.push({rule:s.name,errorText:s.errorText,value:e}),"object"!=typeof l||l.isValid||o.push({rule:s.name,errorText:l.errorText,value:e})}return o});var b;const y=[...a,...d],S=[];y.includes("submit")&&S.push(e.sample({source:e.combine({fieldValue:c,form:r,rulesSources:$}),clock:o})),y.includes("blur")&&S.push(e.sample({source:e.combine({fieldValue:c,form:r,rulesSources:$}),clock:v})),y.includes("change")&&S.push(e.sample({source:e.combine({fieldValue:c,form:r,rulesSources:$}),clock:e.merge([f,E,n])})),S.push(e.sample({source:e.combine({fieldValue:c,form:r,rulesSources:$}),clock:g})),S.push(e.sample({source:e.combine({fieldValue:c,form:r,rulesSources:$}),clock:t}));const T=e.sample({source:c,clock:h,fn:(e,{rule:r,errorText:t})=>({rule:r,value:e,errorText:t})});m.on(S,(e,{form:r,fieldValue:t,rulesSources:o})=>V(t,r,o)).on(T,(e,r)=>[r,...e]).reset(p,i,x,l),y.includes("change")||m.reset(f)}function n({$value:r,$touched:t,onChange:o,changed:i,name:n,reset:s,resetValue:u,filter:l},a,d,c,m){t.on(i,()=>!0).reset(s,d,c),e.guard({source:o,filter:l||(()=>!0),target:i}),r.on(i,(e,r)=>r).on(a,(e,r)=>r.hasOwnProperty(n)?r[n]:e).reset(s,u,m,d)}function s(e){const t=r.useStore(e.$value),o=r.useStore(e.$errors),i=r.useStore(e.$firstError),n=r.useStore(e.$isValid),s=r.useStore(e.$isDirty),u=r.useStore(e.$touched);return{name:e.name,value:t,errors:o,firstError:i,isValid:n,isDirty:s,touched:u,isTouched:u,onChange:e.onChange,onBlur:e.onBlur,addError:e.addError,validate:e.validate,reset:e.reset,set:e.onChange,resetErrors:e.resetErrors,hasError:()=>null!==i,errorText:e=>i?e&&e[i.rule]?e[i.rule]:i.errorText||"":""}}exports.createForm=function(r){const{filter:s,domain:u,fields:l,validateOn:a,units:d}=r,c={},m=[],v=[];for(const e in l){if(!l.hasOwnProperty(e))continue;const r=o(e,l[e],u);c[e]=r,m.push(r.$isDirty),v.push(r.$touched)}const f=function(r){const t={};for(const e in r)r.hasOwnProperty(e)&&(t[e]=r[e].$value);return e.combine(t)}(c),h=function(r){const t=[];for(const e in r){if(!r.hasOwnProperty(e))continue;const{$firstError:o}=r[e];t.push(o)}return e.combine(t).map(e=>e.every(e=>null===e))}(c),g=s?e.combine(h,s,(e,r)=>e&&r):h,p=e.combine(m).map(e=>e.some(Boolean)),E=e.combine(v).map(e=>e.some(Boolean)),x=t.event({domain:u,existing:null==d?void 0:d.validate}),$=t.event({domain:u,existing:null==d?void 0:d.submit}),V=t.event({domain:u,existing:null==d?void 0:d.formValidated}),b=t.event({domain:u,existing:null==d?void 0:d.setForm}),y=t.event({domain:u,existing:null==d?void 0:d.reset}),S=t.event({domain:u,existing:null==d?void 0:d.resetValues}),T=t.event({domain:u,existing:null==d?void 0:d.resetErrors}),F=t.event({domain:u,existing:null==d?void 0:d.resetTouched}),O=e.sample(f,$),B=e.sample(f,x);for(const e in c){if(!c.hasOwnProperty(e))continue;const r=l[e],t=c[e];n(t,b,y,F,S),r.rules&&i({$form:f,rules:r.rules,submitEvent:$,resetFormEvent:y,resetValues:S,resetErrors:T,validateFormEvent:x,field:t,formValidationEvents:a||["submit"],fieldValidationEvents:r.validateOn?r.validateOn:[]})}return e.guard({source:O,filter:g,target:V}),e.guard({source:B,filter:g,target:V}),{fields:c,$values:f,$eachValid:h,$isValid:h,$isDirty:p,$touched:E,submit:$,validate:x,resetTouched:F,reset:y,resetValues:S,resetErrors:T,setForm:b,set:b,formValidated:V}},exports.useField=s,exports.useForm=function(e){const t={};for(const r in e.fields){if(!e.fields.hasOwnProperty(r))continue;const o=e.fields[r];t[r]=s(o)}const o=r.useStore(e.$values),i=r.useStore(e.$eachValid),n=r.useStore(e.$isDirty),u=r.useStore(e.$touched);return{fields:t,values:o,hasError:e=>e?!!t[e]&&Boolean(t[e].firstError):!i,eachValid:i,isValid:i,isDirty:n,isTouched:u,touched:u,errors:e=>t[e]?t[e].errors:[],error:e=>t[e]?t[e].firstError:null,reset:e.reset,errorText:(e,r)=>{const o=t[e];return o&&o.firstError?r&&r[o.firstError.rule]?r[o.firstError.rule]:o.firstError.errorText||"":""},submit:e.submit,setForm:e.setForm,set:e.setForm,formValidated:e.formValidated}};
//# sourceMappingURL=effector-forms.cjs.js.map

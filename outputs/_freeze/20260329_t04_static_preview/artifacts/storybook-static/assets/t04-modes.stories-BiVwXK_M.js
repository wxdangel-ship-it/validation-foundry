import{j as S}from"./jsx-runtime-D_zvdyIk.js";import{l as _,O as b}from"./sample-data-CRPHkVrq.js";import{c as g}from"./story-fixtures-BQKDnfHW.js";import"./index-JhL3uwfD.js";import"./card-CewSI65W.js";const P={title:"T04/Modes",tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:"模式级 stories。用于横向比较平台 Route、导入轨迹和自由探索在 P4 地图主战场上的信息结构与状态差异。"}}},loaders:[async()=>({bundle:await _()})]};function t(r,e,M){const{scenario:y,safetyDrawer:x}=g(r,e,{warningLevel:M,offlineState:"downloaded",satelliteStatus:e==="platform"?"ready":"standby"});return S.jsx(b,{scenario:y,safetyDrawer:x,mapView:"map_2d",overlayOpen:!1,onToggleMapView:()=>{},onOpenSafetyDrawer:()=>{},onCloseSafetyDrawer:()=>{},onEndTrip:()=>{},onBack:()=>{}})}const o={name:"Platform Route Mode",render:(r,{loaded:e})=>t(e.bundle,"platform",1)},a={name:"Imported Track Mode",render:(r,{loaded:e})=>t(e.bundle,"imported",2)},d={name:"Free Explore Mode",render:(r,{loaded:e})=>t(e.bundle,"explore",2)};var n,s,l;o.parameters={...o.parameters,docs:{...(n=o.parameters)==null?void 0:n.docs,source:{originalSource:`{
  name: "Platform Route Mode",
  render: (_, {
    loaded
  }) => renderModeStory(loaded.bundle, "platform", 1)
}`,...(l=(s=o.parameters)==null?void 0:s.docs)==null?void 0:l.source}}};var m,p,c;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
  name: "Imported Track Mode",
  render: (_, {
    loaded
  }) => renderModeStory(loaded.bundle, "imported", 2)
}`,...(c=(p=a.parameters)==null?void 0:p.docs)==null?void 0:c.source}}};var i,u,f;d.parameters={...d.parameters,docs:{...(i=d.parameters)==null?void 0:i.docs,source:{originalSource:`{
  name: "Free Explore Mode",
  render: (_, {
    loaded
  }) => renderModeStory(loaded.bundle, "explore", 2)
}`,...(f=(u=d.parameters)==null?void 0:u.docs)==null?void 0:f.source}}};const R=["PlatformRouteMode","ImportedTrackMode","FreeExploreMode"];export{d as FreeExploreMode,a as ImportedTrackMode,o as PlatformRouteMode,R as __namedExportsOrder,P as default};

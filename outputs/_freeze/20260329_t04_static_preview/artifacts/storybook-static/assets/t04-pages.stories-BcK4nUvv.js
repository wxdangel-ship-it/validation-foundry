import{j as a}from"./jsx-runtime-D_zvdyIk.js";import{A as n}from"./App-B29EAKAr.js";import{l as te,O as de}from"./sample-data-CRPHkVrq.js";import{T as x}from"./trip-summary-page-DD3Bdz1x.js";import{a as E,c as me}from"./story-fixtures-BQKDnfHW.js";import"./index-JhL3uwfD.js";import"./card-CewSI65W.js";import"./browser-EqE7YTww.js";const ye={title:"T04/Pages",component:n,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:"页面级原型 stories。覆盖 P0 Demo Launcher、P2/P3 出发前页面、P4 三模式地图页、P4-overlay 安全抽屉，以及 P5 三模式总结页。"}}},loaders:[async()=>({bundle:await te()})]};function t(r,e,o,ae=!1){const{scenario:oe,safetyDrawer:ne}=me(r,e,{warningLevel:o,offlineState:"downloaded",satelliteStatus:e==="platform"?"ready":"standby"});return a.jsx(de,{scenario:oe,safetyDrawer:ne,mapView:"map_2d",overlayOpen:ae,onToggleMapView:()=>{},onOpenSafetyDrawer:()=>{},onCloseSafetyDrawer:()=>{},onEndTrip:()=>{},onBack:()=>{}})}const d={name:"P0 Demo Launcher",render:(r,{loaded:e})=>a.jsx(n,{initialEntry:"launcher",preloadedBundle:e.bundle})},m={name:"P2 RouteDetail.PlatformRoute",render:(r,{loaded:e})=>a.jsx(n,{initialEntry:"platform",preloadedBundle:e.bundle})},s={name:"P2 RouteDetail.ImportedTrack",render:(r,{loaded:e})=>a.jsx(n,{initialEntry:"imported",preloadedBundle:e.bundle})},l={name:"P3 FreeExplorePlan",render:(r,{loaded:e})=>a.jsx(n,{initialEntry:"explore",preloadedBundle:e.bundle})},p={name:"P4 OffroadMap.PlatformRoute",render:(r,{loaded:e})=>t(e.bundle,"platform",1)},c={name:"P4 OffroadMap.ImportedTrack",render:(r,{loaded:e})=>t(e.bundle,"imported",2)},u={name:"P4 OffroadMap.FreeExplore",render:(r,{loaded:e})=>t(e.bundle,"explore",2)},i={name:"P4-overlay SafetyDrawer.PlatformRoute",render:(r,{loaded:e})=>t(e.bundle,"platform",3,!0)},P={name:"P4-overlay SafetyDrawer.FreeExplore",render:(r,{loaded:e})=>t(e.bundle,"explore",4,!0)},f={name:"P5 Summary.PlatformRoute",render:(r,{loaded:e})=>{const{scenario:o}=E(e.bundle,"platform","completed");return a.jsx(x,{scenario:o,onBackToMap:()=>{}})}},y={name:"P5 Summary.ImportedTrack",render:(r,{loaded:e})=>{const{scenario:o}=E(e.bundle,"imported","completed");return a.jsx(x,{scenario:o,onBackToMap:()=>{}})}},S={name:"P5 Summary.FreeExplore",render:(r,{loaded:e})=>{const{scenario:o}=E(e.bundle,"explore","retreated");return a.jsx(x,{scenario:o,onBackToMap:()=>{}})}};var _,b,M;d.parameters={...d.parameters,docs:{...(_=d.parameters)==null?void 0:_.docs,source:{originalSource:`{
  name: "P0 Demo Launcher",
  render: (_, {
    loaded
  }) => <App initialEntry="launcher" preloadedBundle={loaded.bundle} />
}`,...(M=(b=d.parameters)==null?void 0:b.docs)==null?void 0:M.source}}};var T,D,R;m.parameters={...m.parameters,docs:{...(T=m.parameters)==null?void 0:T.docs,source:{originalSource:`{
  name: "P2 RouteDetail.PlatformRoute",
  render: (_, {
    loaded
  }) => <App initialEntry="platform" preloadedBundle={loaded.bundle} />
}`,...(R=(D=m.parameters)==null?void 0:D.docs)==null?void 0:R.source}}};var g,F,O;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  name: "P2 RouteDetail.ImportedTrack",
  render: (_, {
    loaded
  }) => <App initialEntry="imported" preloadedBundle={loaded.bundle} />
}`,...(O=(F=s.parameters)==null?void 0:F.docs)==null?void 0:O.source}}};var k,v,B;l.parameters={...l.parameters,docs:{...(k=l.parameters)==null?void 0:k.docs,source:{originalSource:`{
  name: "P3 FreeExplorePlan",
  render: (_, {
    loaded
  }) => <App initialEntry="explore" preloadedBundle={loaded.bundle} />
}`,...(B=(v=l.parameters)==null?void 0:v.docs)==null?void 0:B.source}}};var w,I,j;p.parameters={...p.parameters,docs:{...(w=p.parameters)==null?void 0:w.docs,source:{originalSource:`{
  name: "P4 OffroadMap.PlatformRoute",
  render: (_, {
    loaded
  }) => renderMapStory(loaded.bundle, "platform", 1)
}`,...(j=(I=p.parameters)==null?void 0:I.docs)==null?void 0:j.source}}};var h,A,L;c.parameters={...c.parameters,docs:{...(h=c.parameters)==null?void 0:h.docs,source:{originalSource:`{
  name: "P4 OffroadMap.ImportedTrack",
  render: (_, {
    loaded
  }) => renderMapStory(loaded.bundle, "imported", 2)
}`,...(L=(A=c.parameters)==null?void 0:A.docs)==null?void 0:L.source}}};var V,C,q;u.parameters={...u.parameters,docs:{...(V=u.parameters)==null?void 0:V.docs,source:{originalSource:`{
  name: "P4 OffroadMap.FreeExplore",
  render: (_, {
    loaded
  }) => renderMapStory(loaded.bundle, "explore", 2)
}`,...(q=(C=u.parameters)==null?void 0:C.docs)==null?void 0:q.source}}};var z,G,H;i.parameters={...i.parameters,docs:{...(z=i.parameters)==null?void 0:z.docs,source:{originalSource:`{
  name: "P4-overlay SafetyDrawer.PlatformRoute",
  render: (_, {
    loaded
  }) => renderMapStory(loaded.bundle, "platform", 3, true)
}`,...(H=(G=i.parameters)==null?void 0:G.docs)==null?void 0:H.source}}};var J,K,N;P.parameters={...P.parameters,docs:{...(J=P.parameters)==null?void 0:J.docs,source:{originalSource:`{
  name: "P4-overlay SafetyDrawer.FreeExplore",
  render: (_, {
    loaded
  }) => renderMapStory(loaded.bundle, "explore", 4, true)
}`,...(N=(K=P.parameters)==null?void 0:K.docs)==null?void 0:N.source}}};var Q,U,W;f.parameters={...f.parameters,docs:{...(Q=f.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  name: "P5 Summary.PlatformRoute",
  render: (_, {
    loaded
  }) => {
    const {
      scenario
    } = createSummaryStoryFixture(loaded.bundle, "platform", "completed");
    return <TripSummaryPage scenario={scenario} onBackToMap={() => undefined} />;
  }
}`,...(W=(U=f.parameters)==null?void 0:U.docs)==null?void 0:W.source}}};var X,Y,Z;y.parameters={...y.parameters,docs:{...(X=y.parameters)==null?void 0:X.docs,source:{originalSource:`{
  name: "P5 Summary.ImportedTrack",
  render: (_, {
    loaded
  }) => {
    const {
      scenario
    } = createSummaryStoryFixture(loaded.bundle, "imported", "completed");
    return <TripSummaryPage scenario={scenario} onBackToMap={() => undefined} />;
  }
}`,...(Z=(Y=y.parameters)==null?void 0:Y.docs)==null?void 0:Z.source}}};var $,ee,re;S.parameters={...S.parameters,docs:{...($=S.parameters)==null?void 0:$.docs,source:{originalSource:`{
  name: "P5 Summary.FreeExplore",
  render: (_, {
    loaded
  }) => {
    const {
      scenario
    } = createSummaryStoryFixture(loaded.bundle, "explore", "retreated");
    return <TripSummaryPage scenario={scenario} onBackToMap={() => undefined} />;
  }
}`,...(re=(ee=S.parameters)==null?void 0:ee.docs)==null?void 0:re.source}}};const Se=["P0DemoLauncher","P2RouteDetailPlatformRoute","P2RouteDetailImportedTrack","P3FreeExplorePlan","P4OffroadMapPlatformRoute","P4OffroadMapImportedTrack","P4OffroadMapFreeExplore","P4OverlaySafetyDrawerPlatformRoute","P4OverlaySafetyDrawerFreeExplore","P5SummaryPlatformRoute","P5SummaryImportedTrack","P5SummaryFreeExplore"];export{d as P0DemoLauncher,s as P2RouteDetailImportedTrack,m as P2RouteDetailPlatformRoute,l as P3FreeExplorePlan,u as P4OffroadMapFreeExplore,c as P4OffroadMapImportedTrack,p as P4OffroadMapPlatformRoute,P as P4OverlaySafetyDrawerFreeExplore,i as P4OverlaySafetyDrawerPlatformRoute,S as P5SummaryFreeExplore,y as P5SummaryImportedTrack,f as P5SummaryPlatformRoute,Se as __namedExportsOrder,ye as default};

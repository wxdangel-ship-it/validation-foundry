import{j as d}from"./jsx-runtime-D_zvdyIk.js";import{F as _e,T as b,R as xe}from"./trip-summary-page-DD3Bdz1x.js";import{l as be,O as Le}from"./sample-data-CRPHkVrq.js";import{b as De,a as L,d as Me,c as Re}from"./story-fixtures-BQKDnfHW.js";import"./index-JhL3uwfD.js";import"./card-CewSI65W.js";const ke={title:"T04/States",tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:"状态级 stories。用于验证下载状态、地图普通态/3D 态、四级警示、安全抽屉开合，以及 P3 Ready Gate 和 P5 完成状态。"}}},loaders:[async()=>({bundle:await be()})]};function M(n,e){const{scenario:a,snapshot:r,points:t}=Me(n,"platform");return d.jsx(xe,{scenario:a,snapshot:r,downloadState:e,mapView:"map_2d",onToggleMapView:()=>{},onDownload:()=>{},onDeleteDownload:()=>{},onGoMap:()=>{},onBack:()=>{},onEnterExplore:()=>{},onSetStartPoint:()=>{},onHighlightPoint:()=>{},points:t})}function o(n,e){const{scenario:a,safetyDrawer:r}=Re(n,e.mode,{warningLevel:e.warningLevel,offlineState:"downloaded",satelliteStatus:e.warningLevel===4?"ready":"standby"});return d.jsx(Le,{scenario:a,safetyDrawer:r,mapView:e.mapView,overlayOpen:e.overlayOpen??!1,onToggleMapView:()=>{},onOpenSafetyDrawer:()=>{},onCloseSafetyDrawer:()=>{},onEndTrip:()=>{},onBack:()=>{}})}const s={name:"下载状态.未下载",render:(n,{loaded:e})=>M(e.bundle,"not_downloaded")},l={name:"下载状态.下载中",render:(n,{loaded:e})=>M(e.bundle,"downloading")},m={name:"下载状态.下载完成",render:(n,{loaded:e})=>M(e.bundle,"downloaded")},i={name:"地图状态.普通态",render:(n,{loaded:e})=>o(e.bundle,{mode:"platform",mapView:"map_2d",warningLevel:1})},p={name:"地图状态.3D态",render:(n,{loaded:e})=>o(e.bundle,{mode:"platform",mapView:"map_3d",warningLevel:1})},c={name:"警示状态.Level1",render:(n,{loaded:e})=>o(e.bundle,{mode:"platform",mapView:"map_2d",warningLevel:1})},u={name:"警示状态.Level2",render:(n,{loaded:e})=>o(e.bundle,{mode:"platform",mapView:"map_2d",warningLevel:2})},w={name:"警示状态.Level3",render:(n,{loaded:e})=>o(e.bundle,{mode:"imported",mapView:"map_2d",warningLevel:3})},S={name:"警示状态.Level4",render:(n,{loaded:e})=>o(e.bundle,{mode:"explore",mapView:"map_2d",warningLevel:4})},g={name:"安全抽屉.关闭",render:(n,{loaded:e})=>o(e.bundle,{mode:"explore",mapView:"map_2d",warningLevel:2})},v={name:"安全抽屉.打开",render:(n,{loaded:e})=>o(e.bundle,{mode:"explore",mapView:"map_2d",warningLevel:4,overlayOpen:!0})},f={name:"总结页.完成",render:(n,{loaded:e})=>{const{scenario:a}=L(e.bundle,"platform","completed");return d.jsx(b,{scenario:a,onBackToMap:()=>{}})}},y={name:"总结页.中止",render:(n,{loaded:e})=>{const{scenario:a}=L(e.bundle,"imported","aborted");return d.jsx(b,{scenario:a,onBackToMap:()=>{}})}},_={name:"总结页.回撤完成",render:(n,{loaded:e})=>{const{scenario:a}=L(e.bundle,"explore","retreated");return d.jsx(b,{scenario:a,onBackToMap:()=>{}})}},D={name:"P3 ReadyGate.Blocked",render:(n,{loaded:e})=>{const{scenario:a,snapshot:r,points:t}=De(e.bundle);return d.jsx(_e,{scenario:a,snapshot:r,downloadState:"not_downloaded",mapView:"map_2d",isExploreReady:!1,onToggleMapView:()=>{},onDownload:()=>{},onDeleteDownload:()=>{},onGoMap:()=>{},onBack:()=>{},onSetStartPoint:()=>{},onAddSafetyAnchor:()=>{},onConfirmRange:()=>{},points:t})}},x={name:"P3 ReadyGate.Ready",render:(n,{loaded:e})=>{const{scenario:a,snapshot:r,points:t}=De(e.bundle,{startPointName:"新闯路备用集合点",routeStartConfirmed:!0,safetyAnchorCount:1,rangeConfirmed:!0});return d.jsx(_e,{scenario:a,snapshot:r,downloadState:"downloaded",mapView:"map_2d",isExploreReady:!0,onToggleMapView:()=>{},onDownload:()=>{},onDeleteDownload:()=>{},onGoMap:()=>{},onBack:()=>{},onSetStartPoint:()=>{},onAddSafetyAnchor:()=>{},onConfirmRange:()=>{},points:t})}};var R,V,P;s.parameters={...s.parameters,docs:{...(R=s.parameters)==null?void 0:R.docs,source:{originalSource:`{
  name: "下载状态.未下载",
  render: (_, {
    loaded
  }) => renderRouteDownloadState(loaded.bundle, "not_downloaded")
}`,...(P=(V=s.parameters)==null?void 0:V.docs)==null?void 0:P.source}}};var E,T,h;l.parameters={...l.parameters,docs:{...(E=l.parameters)==null?void 0:E.docs,source:{originalSource:`{
  name: "下载状态.下载中",
  render: (_, {
    loaded
  }) => renderRouteDownloadState(loaded.bundle, "downloading")
}`,...(h=(T=l.parameters)==null?void 0:T.docs)==null?void 0:h.source}}};var B,k,C;m.parameters={...m.parameters,docs:{...(B=m.parameters)==null?void 0:B.docs,source:{originalSource:`{
  name: "下载状态.下载完成",
  render: (_, {
    loaded
  }) => renderRouteDownloadState(loaded.bundle, "downloaded")
}`,...(C=(k=m.parameters)==null?void 0:k.docs)==null?void 0:C.source}}};var G,F,A;i.parameters={...i.parameters,docs:{...(G=i.parameters)==null?void 0:G.docs,source:{originalSource:`{
  name: "地图状态.普通态",
  render: (_, {
    loaded
  }) => renderMapState(loaded.bundle, {
    mode: "platform",
    mapView: "map_2d",
    warningLevel: 1
  })
}`,...(A=(F=i.parameters)==null?void 0:F.docs)==null?void 0:A.source}}};var O,j,W;p.parameters={...p.parameters,docs:{...(O=p.parameters)==null?void 0:O.docs,source:{originalSource:`{
  name: "地图状态.3D态",
  render: (_, {
    loaded
  }) => renderMapState(loaded.bundle, {
    mode: "platform",
    mapView: "map_3d",
    warningLevel: 1
  })
}`,...(W=(j=p.parameters)==null?void 0:j.docs)==null?void 0:W.source}}};var N,H,q;c.parameters={...c.parameters,docs:{...(N=c.parameters)==null?void 0:N.docs,source:{originalSource:`{
  name: "警示状态.Level1",
  render: (_, {
    loaded
  }) => renderMapState(loaded.bundle, {
    mode: "platform",
    mapView: "map_2d",
    warningLevel: 1
  })
}`,...(q=(H=c.parameters)==null?void 0:H.docs)==null?void 0:q.source}}};var z,I,J;u.parameters={...u.parameters,docs:{...(z=u.parameters)==null?void 0:z.docs,source:{originalSource:`{
  name: "警示状态.Level2",
  render: (_, {
    loaded
  }) => renderMapState(loaded.bundle, {
    mode: "platform",
    mapView: "map_2d",
    warningLevel: 2
  })
}`,...(J=(I=u.parameters)==null?void 0:I.docs)==null?void 0:J.source}}};var K,Q,U;w.parameters={...w.parameters,docs:{...(K=w.parameters)==null?void 0:K.docs,source:{originalSource:`{
  name: "警示状态.Level3",
  render: (_, {
    loaded
  }) => renderMapState(loaded.bundle, {
    mode: "imported",
    mapView: "map_2d",
    warningLevel: 3
  })
}`,...(U=(Q=w.parameters)==null?void 0:Q.docs)==null?void 0:U.source}}};var X,Y,Z;S.parameters={...S.parameters,docs:{...(X=S.parameters)==null?void 0:X.docs,source:{originalSource:`{
  name: "警示状态.Level4",
  render: (_, {
    loaded
  }) => renderMapState(loaded.bundle, {
    mode: "explore",
    mapView: "map_2d",
    warningLevel: 4
  })
}`,...(Z=(Y=S.parameters)==null?void 0:Y.docs)==null?void 0:Z.source}}};var $,ee,ne;g.parameters={...g.parameters,docs:{...($=g.parameters)==null?void 0:$.docs,source:{originalSource:`{
  name: "安全抽屉.关闭",
  render: (_, {
    loaded
  }) => renderMapState(loaded.bundle, {
    mode: "explore",
    mapView: "map_2d",
    warningLevel: 2
  })
}`,...(ne=(ee=g.parameters)==null?void 0:ee.docs)==null?void 0:ne.source}}};var ae,oe,re;v.parameters={...v.parameters,docs:{...(ae=v.parameters)==null?void 0:ae.docs,source:{originalSource:`{
  name: "安全抽屉.打开",
  render: (_, {
    loaded
  }) => renderMapState(loaded.bundle, {
    mode: "explore",
    mapView: "map_2d",
    warningLevel: 4,
    overlayOpen: true
  })
}`,...(re=(oe=v.parameters)==null?void 0:oe.docs)==null?void 0:re.source}}};var de,te,se;f.parameters={...f.parameters,docs:{...(de=f.parameters)==null?void 0:de.docs,source:{originalSource:`{
  name: "总结页.完成",
  render: (_, {
    loaded
  }) => {
    const {
      scenario
    } = createSummaryStoryFixture(loaded.bundle, "platform", "completed");
    return <TripSummaryPage scenario={scenario} onBackToMap={() => undefined} />;
  }
}`,...(se=(te=f.parameters)==null?void 0:te.docs)==null?void 0:se.source}}};var le,me,ie;y.parameters={...y.parameters,docs:{...(le=y.parameters)==null?void 0:le.docs,source:{originalSource:`{
  name: "总结页.中止",
  render: (_, {
    loaded
  }) => {
    const {
      scenario
    } = createSummaryStoryFixture(loaded.bundle, "imported", "aborted");
    return <TripSummaryPage scenario={scenario} onBackToMap={() => undefined} />;
  }
}`,...(ie=(me=y.parameters)==null?void 0:me.docs)==null?void 0:ie.source}}};var pe,ce,ue;_.parameters={..._.parameters,docs:{...(pe=_.parameters)==null?void 0:pe.docs,source:{originalSource:`{
  name: "总结页.回撤完成",
  render: (_, {
    loaded
  }) => {
    const {
      scenario
    } = createSummaryStoryFixture(loaded.bundle, "explore", "retreated");
    return <TripSummaryPage scenario={scenario} onBackToMap={() => undefined} />;
  }
}`,...(ue=(ce=_.parameters)==null?void 0:ce.docs)==null?void 0:ue.source}}};var we,Se,ge;D.parameters={...D.parameters,docs:{...(we=D.parameters)==null?void 0:we.docs,source:{originalSource:`{
  name: "P3 ReadyGate.Blocked",
  render: (_, {
    loaded
  }) => {
    const {
      scenario,
      snapshot,
      points
    } = createExploreStoryFixture(loaded.bundle);
    return <FreeExplorePlanPage scenario={scenario} snapshot={snapshot} downloadState="not_downloaded" mapView="map_2d" isExploreReady={false} onToggleMapView={() => undefined} onDownload={() => undefined} onDeleteDownload={() => undefined} onGoMap={() => undefined} onBack={() => undefined} onSetStartPoint={() => undefined} onAddSafetyAnchor={() => undefined} onConfirmRange={() => undefined} points={points} />;
  }
}`,...(ge=(Se=D.parameters)==null?void 0:Se.docs)==null?void 0:ge.source}}};var ve,fe,ye;x.parameters={...x.parameters,docs:{...(ve=x.parameters)==null?void 0:ve.docs,source:{originalSource:`{
  name: "P3 ReadyGate.Ready",
  render: (_, {
    loaded
  }) => {
    const {
      scenario,
      snapshot,
      points
    } = createExploreStoryFixture(loaded.bundle, {
      startPointName: "新闯路备用集合点",
      routeStartConfirmed: true,
      safetyAnchorCount: 1,
      rangeConfirmed: true
    });
    return <FreeExplorePlanPage scenario={scenario} snapshot={snapshot} downloadState="downloaded" mapView="map_2d" isExploreReady onToggleMapView={() => undefined} onDownload={() => undefined} onDeleteDownload={() => undefined} onGoMap={() => undefined} onBack={() => undefined} onSetStartPoint={() => undefined} onAddSafetyAnchor={() => undefined} onConfirmRange={() => undefined} points={points} />;
  }
}`,...(ye=(fe=x.parameters)==null?void 0:fe.docs)==null?void 0:ye.source}}};const Ce=["DownloadNotDownloaded","DownloadDownloading","DownloadDownloaded","MapState2D","MapState3D","WarningLevel1","WarningLevel2","WarningLevel3","WarningLevel4","SafetyDrawerClosed","SafetyDrawerOpen","SummaryCompleted","SummaryAborted","SummaryRetreated","ExploreReadyGateBlocked","ExploreReadyGateReady"];export{m as DownloadDownloaded,l as DownloadDownloading,s as DownloadNotDownloaded,D as ExploreReadyGateBlocked,x as ExploreReadyGateReady,i as MapState2D,p as MapState3D,g as SafetyDrawerClosed,v as SafetyDrawerOpen,y as SummaryAborted,f as SummaryCompleted,_ as SummaryRetreated,c as WarningLevel1,u as WarningLevel2,w as WarningLevel3,S as WarningLevel4,Ce as __namedExportsOrder,ke as default};

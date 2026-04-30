import{a as e,n as t}from"./chunk-BneVvdWh.js";import{n,t as r,w as i}from"./iframe-CNGQcbtn.js";import{t as a}from"./jsx-runtime-D16BNjX-.js";import{n as o,t as s}from"./DragStateManager-Cyda4dXv.js";import{a as c,c as l,n as u,r as d,s as f,t as p}from"./ScrollPane-cskcPJxg.js";import{n as m,t as h}from"./Tab-BADbyOQD.js";var g,_,v,y,b,x=t((()=>{c(),g=a(),_=(e,t)=>({width:e,height:t,background:`#1e1e1e`,border:`1px solid #3c3c3c`}),v=(e,t)=>n=>(0,g.jsx)(`div`,{style:_(e,t),children:(0,g.jsx)(n,{})}),y=(e,t)=>(0,g.jsxs)(`div`,{style:{padding:16,color:`#d4d4d4`,fontFamily:`ui-monospace, monospace`,fontSize:13,lineHeight:1.5},children:[(0,g.jsx)(`div`,{style:{color:`#9cdcfe`,marginBottom:8},children:e}),(0,g.jsx)(`pre`,{style:{margin:0,whiteSpace:`pre-wrap`},children:t??d(100)})]}),b=(e,t=`Tab`,n=1)=>Array.from({length:e},(e,r)=>({id:r+n,label:`${t} ${r+1}`,content:y(`${t} ${r+1}`)}));try{_.displayName=`getBodyCss`,_.__docgenInfo={description:`A function for getting consistent CSS for use in Storybook stories.`,displayName:`getBodyCss`,filePath:`D:/peter/Projects/pane-craft/src/test-utils/test-react.util.tsx`,methods:[],props:{},tags:{param:`width - The width of the element.
height - The height of the element.`,returns:`A {@link React.CSSProperties } object for styling an element.`}}}catch{}try{v.displayName=`createFrameDecorator`,v.__docgenInfo={description:`A function for creating a Storybook decorator.`,displayName:`createFrameDecorator`,filePath:`D:/peter/Projects/pane-craft/src/test-utils/test-react.util.tsx`,methods:[],props:{},tags:{param:`width - The width of the container element.
height - The height of the container element.`,returns:`A wrapper to display a Storybook story in.`}}}catch{}try{y.displayName=`createTabContent`,y.__docgenInfo={description:`A function for creating a tab's content area. Used in Storybook stories.`,displayName:`createTabContent`,filePath:`D:/peter/Projects/pane-craft/src/test-utils/test-react.util.tsx`,methods:[],props:{},tags:{param:`label - The base label to assign to each tab. A label of 'Tab' will\r
display tabs labeled 'Tab 1', 'Tab 2', etc.
startingId - Text to be displayed in the body after the header text.\r
Defaults to 'Lorem Ipsum' text.`,returns:`A React node for displaying the content.`}}}catch{}try{b.displayName=`createTabItemList`,b.__docgenInfo={description:`A function for creating a test list of {@link TabItem}s.`,displayName:`createTabItemList`,filePath:`D:/peter/Projects/pane-craft/src/test-utils/test-react.util.tsx`,methods:[],props:{},tags:{param:`numTabs - The number of test tabs to create.
label - The base label to assign to each tab. Optional, defaults to\r
'Tab'.
startingId - The number to start the sequential ids with.`,returns:`A list of {@link TabItem }s.`}}}catch{}})),S,C,w=t((()=>{S=e(i(),1),l(),C=(e={})=>{let{manager:t,onTabClick:n,onTabClose:r}=e,i=(0,S.useMemo)(()=>t??new f,[t]),[a,o]=(0,S.useState)(()=>i.getState()),[s,c]=(0,S.useState)(i);s!==i&&(c(i),o(i.getState())),(0,S.useEffect)(()=>i.subscribe(()=>{o(i.getState())}),[i]);let l=(0,S.useCallback)(e=>{let t=i.getState().activeId;i.setActive(e.id),t!==e.id&&n?.(e)},[i,n]),u=(0,S.useCallback)(e=>{let t=i.getState().itemMap.get(e);t!==void 0&&(i.removeTab(e),r?.(t))},[i,r]),d=(0,S.useCallback)(e=>({isActive:a.activeId===e.id,onClick:()=>{l(e)},onClose:u}),[a.activeId,l,u]),p=(0,S.useCallback)(e=>{let{order:t,activeId:r}=i.getState();if(t.length===0)return;let a=r===null?-1:t.indexOf(r),o=null;switch(e.key){case`ArrowLeft`:o=a<=0?t.length-1:a-1;break;case`ArrowRight`:o=a===-1||a===t.length-1?0:a+1;break;case`Home`:o=0;break;case`End`:o=t.length-1;break;default:return}e.preventDefault();let s=t[o];if(s===r)return;let c=i.getState().itemMap.get(s);c!==void 0&&(i.setActive(s),n?.(c))},[i,n]),m=(0,S.useMemo)(()=>({role:`tablist`,onKeyDown:p}),[p]);return{state:{tabList:a.order.map(e=>a.itemMap.get(e)).filter(e=>e!==void 0),activeTab:a.activeId===null?null:a.itemMap.get(a.activeId)??null,activeId:a.activeId},getTabHandlers:d,tabListHandlers:m,manager:i}}})),T,E,D=t((()=>{T=e(i(),1),o(),E=e=>{let{paneId:t,manager:n,onTabDrop:r,onTabListDrop:i}=e,a=(0,T.useMemo)(()=>n??new s,[n]),[o,c]=(0,T.useState)(()=>a.getState()),[l,u]=(0,T.useState)(a);l!==a&&(u(a),c(a.getState())),(0,T.useEffect)(()=>a.subscribe(()=>{c(a.getState())}),[a]);let d=(0,T.useCallback)((e,n)=>{e.dataTransfer.effectAllowed=`move`,e.dataTransfer.setData(`text/plain`,String(n.id)),a.start(n,t)},[a,t]),f=(0,T.useCallback)((e,n)=>{if(a.getState().draggedTab===null)return;e.preventDefault(),e.stopPropagation(),e.dataTransfer.dropEffect=`move`;let{draggedTab:r,sourcePaneId:i}=a.getState();if(r?.id===n.id&&i===t)return;let o=e.currentTarget.getBoundingClientRect(),s=o.left+o.width/2,c=e.clientX<s?`left`:`right`;a.setTabHover({tabId:n.id,side:c})},[a,t]),p=(0,T.useCallback)(()=>{a.end()},[a]),m=(0,T.useCallback)((e,n)=>{e.preventDefault(),e.stopPropagation();let{draggedTab:i,sourcePaneId:o}=a.getState();if(i===null||o===null){a.end();return}if(i.id===n.id&&o===t){a.end();return}let s=e.currentTarget.getBoundingClientRect(),c=s.left+s.width/2,l=e.clientX<c?`left`:`right`;r?.({tab:i,sourcePaneId:o,targetPaneId:t,targetTab:n,side:l}),a.end()},[a,t,r]),h=(0,T.useCallback)(e=>{a.getState().draggedTab&&(e.preventDefault(),e.dataTransfer.dropEffect=`move`,e.target.closest(`[data-tab-id]`)===null&&a.getState().tabDropTargetHover&&a.setTabHover(null))},[a]),g=(0,T.useCallback)(e=>{e.preventDefault();let{draggedTab:n,sourcePaneId:r}=a.getState();if(n===null||r===null){a.end();return}e.target.closest(`[data-tab-id]`)===null&&(i?.({tab:n,sourcePaneId:r,targetPaneId:t}),a.end())},[a,t,i]),_=(0,T.useCallback)(e=>({draggable:!0,onDragStart:t=>{d(t,e)},onDragOver:t=>{f(t,e)},onDragEnd:p,onDrop:t=>{m(t,e)}}),[d,f,p,m]),v=(0,T.useMemo)(()=>({onDragOver:h,onDrop:g}),[h,g]);return{state:{draggedTab:o.draggedTab,sourcePaneId:o.sourcePaneId,isDraggingFromThisPane:o.draggedTab!==null&&o.sourcePaneId===t,tabDropTargetHover:o.tabDropTargetHover},getTabHandlers:_,tabListHandlers:v,manager:a}}})),O,k,A,j,M=t((()=>{O=`pc_tabList_8sW2te`,k=`pc_list_eJuZrc`,A=`pc_tabWrapper_9ucnJS`,j={tabList:O,list:k,tabWrapper:A}})),N,P,F=t((()=>{D(),w(),n(),r(),u(),m(),M(),N=a(),P=({tabManager:e,paneId:t=0,dragAndDropManager:n,isScrollable:r=!0,onTabClick:i,onTabClose:a,onTabDrop:o,onTabListDrop:s,className:c=``,a11y:l={}})=>{let{state:u,getTabHandlers:d,tabListHandlers:f}=C({manager:e,onTabClick:i,onTabClose:a}),{state:m,getTabHandlers:g,tabListHandlers:_}=E({paneId:t,manager:n,onTabDrop:o,onTabListDrop:s}),v=[j.tabList,c].filter(Boolean).join(` `),y=e=>{let t=d(e),n=g(e),r=m.isDraggingFromThisPane&&m.draggedTab?.id===e.id,i=m.tabDropTargetHover?.tabId===e.id?m.tabDropTargetHover.side:null,a=()=>{t.onClick(),e.onClick?.()};return(0,N.jsx)(`div`,{className:j.tabWrapper,"data-testid":`tab-wrapper-${e.id}`,...n,children:(0,N.jsx)(h,{...e,isActive:t.isActive,isDragged:r,dropTargetSide:i,onClick:a,onClose:t.onClose})},e.id)},b=(0,N.jsx)(`div`,{role:f.role,tabIndex:0,className:j.list,"data-testid":`tab-list-container`,onKeyDown:f.onKeyDown,children:u.tabList.map(y)});return(0,N.jsx)(`div`,{className:v,"data-testid":`tab-list`,"data-pane-id":t,onDragOver:_.onDragOver,onDrop:_.onDrop,...l,children:r?(0,N.jsx)(p,{orientation:`horizontal`,children:b}):b})};try{TabListProps.displayName=`TabListProps`,TabListProps.__docgenInfo={description:`Props for the {@link TabList } component.`,displayName:`TabListProps`,filePath:`D:/peter/Projects/pane-craft/src/components/TabList/TabList.tsx`,methods:[],props:{},tags:{remarks:`\`TabList\` is the batteries-included tab bar. It composes:\r
\r
- \`useTabList\` for selection state and keyboard navigation,\r
- \`useTabDragAndDrop\` for tab drag-and-drop (always enabled), and\r
- \`ScrollPane\` for horizontal overflow scrolling (toggleable via\r
  {@link TabListProps.isScrollable }).\r
\r
Each managed tab is rendered with a \`<Tab />\`. The component is fully\r
controlled by the supplied (or internally created) state managers — there\r
is no internal tab data store of its own.\r
\r
For finer-grained control (e.g. custom tab rendering, custom keyboard\r
behaviour, drag disabled), drop down one layer and call \`useTabList\`\r
directly while rendering your own tabs.`}}}catch{}try{P.displayName=`TabList`,P.__docgenInfo={description:`The batteries-included tab bar.`,displayName:`TabList`,filePath:`D:/peter/Projects/pane-craft/src/components/TabList/TabList.tsx`,methods:[],props:{className:{defaultValue:{value:``},declarations:[{fileName:`pane-craft/src/types/Base.type.ts`,name:`TypeLiteral`}],description:`Additional CSS class names merged onto the root element.`,name:`className`,required:!1,tags:{},type:{name:`string`}},a11y:{defaultValue:{value:`{}`},declarations:[{fileName:`pane-craft/src/types/Base.type.ts`,name:`TypeLiteral`}],description:`ARIA and accessibility attributes forwarded to the root element.`,name:`a11y`,required:!1,tags:{remarks:`Accepts any valid ARIA attribute (role, aria-*, tabIndex, etc.).\r
This lets consumers compose accessible patterns (e.g. tab lists)\r
without the component needing to know about them.`,example:"```tsx\r\n<Tab a11y={{ role: 'tab', tabIndex: 0, 'aria-selected': isActive }} />\r\n```"},type:{name:`(AriaAttributes & { role?: AriaRole; tabIndex?: number; }) | undefined`}},tabManager:{defaultValue:null,declarations:[{fileName:`pane-craft/src/types/TabList.type.ts`,name:`TypeLiteral`}],description:`Tab state manager that owns the tab collection.`,name:`tabManager`,required:!1,tags:{remarks:`Pass one in when the tab data is owned outside the component (e.g. when\r
several views need to share the same tabs, or when state needs to be\r
seeded before mount). When omitted, an empty internal manager is created\r
and lives for the component's lifetime.`},type:{name:`TabStateManager`}},paneId:{defaultValue:{value:`0`},declarations:[{fileName:`pane-craft/src/types/TabList.type.ts`,name:`TypeLiteral`}],description:`Identifier used by the drag system to distinguish this tab list from
other tab lists in the same drag session.`,name:`paneId`,required:!1,tags:{remarks:"Cross-pane drag-and-drop requires every participating `TabList` to use\r\nthe same {@link TabListProps.dragAndDropManager } **and** to have a unique\r\n`paneId`. For single-list usage the default of `0` is fine.",default:`0`},type:{name:`number`}},dragAndDropManager:{defaultValue:null,declarations:[{fileName:`pane-craft/src/types/TabList.type.ts`,name:`TypeLiteral`}],description:`Shared drag state manager.`,name:`dragAndDropManager`,required:!1,tags:{remarks:`Pass the same instance to every \`TabList\` that should participate in the\r
same drag session (typically all tab lists in a pane tree). When omitted,\r
an internal manager is created — drag-and-drop will work within this\r
component but tabs cannot be dragged into or out of other tab lists.`},type:{name:`DragStateManager`}},isScrollable:{defaultValue:{value:`true`},declarations:[{fileName:`pane-craft/src/types/TabList.type.ts`,name:`TypeLiteral`}],description:"Whether to wrap the tab row in a horizontal `ScrollPane`.",name:`isScrollable`,required:!1,tags:{remarks:"When `true` the tab row is horizontally scrollable with a custom\r\nauto-hide scrollbar; long tab lists scroll instead of wrapping. When\r\n`false` the tabs render in a plain flex row that overflows the container.",default:`true`},type:{name:`boolean`}},onTabClick:{defaultValue:null,declarations:[{fileName:`pane-craft/src/types/TabList.type.ts`,name:`TypeLiteral`}],description:`Called after a tab is activated via click or keyboard. Fires only on
actual state change.`,name:`onTabClick`,required:!1,tags:{},type:{name:`((tab: TabItem) => void)`}},onTabClose:{defaultValue:null,declarations:[{fileName:`pane-craft/src/types/TabList.type.ts`,name:`TypeLiteral`}],description:`Called after a tab is removed via the close button. Receives the tab as
it existed before removal.`,name:`onTabClose`,required:!1,tags:{},type:{name:`((tab: TabItem) => void)`}},onTabDrop:{defaultValue:null,declarations:[{fileName:`pane-craft/src/types/TabList.type.ts`,name:`TypeLiteral`}],description:`Called when a dragged tab is dropped on top of another tab in this list.`,name:`onTabDrop`,required:!1,tags:{remarks:"The component does not perform the reorder/move itself — wire this to\r\nthe manager(s) and decide what the drop should do. Typical\r\nimplementations call `manager.reorder(...)` for same-pane drops and\r\n`manager.removeTab(...)` + `targetManager.addTab(..., index)` for\r\ncross-pane drops."},type:{name:`((data: TabDropPayload) => void)`}},onTabListDrop:{defaultValue:null,declarations:[{fileName:`pane-craft/src/types/TabList.type.ts`,name:`TypeLiteral`}],description:`Called when a dragged tab is dropped on the empty space of this list.
Conventionally treated as "append to the end".`,name:`onTabListDrop`,required:!1,tags:{},type:{name:`((data: TabListDropPayload) => void)`}}},tags:{remarks:`Renders an ordered, horizontally-scrollable row of \`<Tab />\` elements with\r
mouse selection, ARIA keyboard navigation, and tab drag-and-drop wired up\r
out of the box. Internally composes:\r
\r
- {@link useTabList } — selection + arrow-key activation,\r
- {@link useTabDragAndDrop } — HTML5 tab drag-and-drop,\r
- {@link ScrollPane } — overflow scrolling with a custom auto-hide scrollbar.\r
\r
Tab data is owned by an external (or auto-created) \`TabStateManager\`.\r
\`TabList\` does not store the tab collection itself — every render derives\r
from the manager. The same applies to drag state via \`DragStateManager\`.`,example:`Single-list, all defaults (auto-created managers, drag enabled within the\r
list only):\r
\`\`\`tsx\r
<TabList\r
  onTabClick={(tab) => console.log('opened', tab.id)}\r
  onTabClose={(tab) => console.log('closed', tab.id)}\r
/>\r
\`\`\`
Two coordinated tab lists in different panes sharing one drag manager so\r
tabs can be dragged between them:\r
\`\`\`tsx\r
const dragManager = useMemo(() => new DragStateManager(), []);\r
const leftTabs = useMemo(() => new TabStateManager(), []);\r
const rightTabs = useMemo(() => new TabStateManager(), []);\r
\r
return (\r
  <>\r
    <TabList\r
      paneId={0}\r
      manager={leftTabs}\r
      dragAndDropManager={dragManager}\r
      onTabDrop={...}\r
      onTabListDrop={...}\r
    />\r
    <TabList\r
      paneId={1}\r
      manager={rightTabs}\r
      dragAndDropManager={dragManager}\r
      onTabDrop={...}\r
      onTabListDrop={...}\r
    />\r
  </>\r
);\r
\`\`\``,see:`{@link TabListProps } for full prop documentation.`}}}catch{}}));export{v as a,_ as c,C as i,x as l,F as n,y as o,w as r,b as s,P as t};
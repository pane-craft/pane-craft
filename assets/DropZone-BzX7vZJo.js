import{a as e,n as t}from"./chunk-BneVvdWh.js";import{n,t as r,w as i}from"./iframe-CNGQcbtn.js";import{t as a}from"./jsx-runtime-D16BNjX-.js";import{n as o,t as s}from"./DragStateManager-Cyda4dXv.js";var c,l,u=t((()=>{c=e(i(),1),o(),l=e=>{let{paneId:t,manager:n,onDrop:r}=e,i=(0,c.useMemo)(()=>n??new s,[n]),[a,o]=(0,c.useState)(()=>i.getState()),[l,u]=(0,c.useState)(i);l!==i&&(u(i),o(i.getState())),(0,c.useEffect)(()=>i.subscribe(()=>{o(i.getState())}),[i]);let d=(0,c.useCallback)((e,n)=>{if(i.getState().draggedTab===null)return;e.preventDefault(),e.stopPropagation(),e.dataTransfer.dropEffect=`move`;let r=i.getState().dropZoneHover;r?.paneId===t&&r.pos===n||i.setDropZoneHover({paneId:t,pos:n})},[i,t]),f=(0,c.useCallback)((e,n)=>{let r=i.getState().dropZoneHover;r?.paneId===t&&r.pos===n&&i.setDropZoneHover(null)},[i,t]),p=(0,c.useCallback)((e,n)=>{e.preventDefault(),e.stopPropagation();let{draggedTab:a,sourcePaneId:o}=i.getState();if(a===null||o===null){i.end();return}r?.({tab:a,sourcePaneId:o,targetPaneId:t,pos:n}),i.end()},[i,t,r]),m=(0,c.useCallback)(e=>({onDragOver:t=>{d(t,e)},onDragLeave:t=>{f(t,e)},onDrop:t=>{p(t,e)}}),[d,f,p]);return{state:{draggedTab:a.draggedTab,sourcePaneId:a.sourcePaneId,isDraggingFromThisPane:a.draggedTab!==null&&a.sourcePaneId===t,dropZoneHover:a.dropZoneHover},getDropZoneHandlers:m,manager:i}}})),d,f=t((()=>{d=[`center`,`top`,`bottom`,`left`,`right`]})),p,m,h,g,_,v,y,b,x=t((()=>{p=`pc_dropZone_2yNpIs`,m=`pc_zone_ctLJ9T`,h=`pc_zoneCenter_unoXHn`,g=`pc_zoneTop_be4kAJ`,_=`pc_zoneBottom_kWWb4R`,v=`pc_zoneLeft_QYWPXW`,y=`pc_zoneRight_z1pAVQ`,b={dropZone:p,zone:m,zoneCenter:h,zoneTop:g,zoneBottom:_,zoneLeft:v,zoneRight:y}})),S,C,w,T,E=t((()=>{S=e(i(),1),u(),n(),r(),f(),x(),C=a(),w={center:b.zoneCenter,top:b.zoneTop,bottom:b.zoneBottom,left:b.zoneLeft,right:b.zoneRight},T=({paneId:e=0,dragAndDropManager:t,onDrop:n,dropZonePosList:r=d,edgeSize:i,className:a=``,a11y:o={}})=>{let{state:s,getDropZoneHandlers:c,manager:u}=l({paneId:e,manager:t,onDrop:n}),f=s.draggedTab!==null,[p,m]=(0,S.useState)(!1);(0,S.useEffect)(()=>u.on(`DRAG_ENDED`,()=>{m(!1)}),[u]);let h=e=>{if(!f)return;let t=e.relatedTarget;t!==null&&e.currentTarget.contains(t)||m(!0)},g=e=>{if(!f)return;let t=e.relatedTarget;t!==null&&e.currentTarget.contains(t)||m(!1)},_=[b.dropZone,a].filter(Boolean).join(` `),v={};return i!==void 0&&(v[`--pc-dropzone-edge-size`]=i),(0,C.jsx)(`div`,{className:_,style:v,"data-testid":`drop-zone`,"data-pane-id":e,"data-is-dragging":f,"data-is-pointer-inside":p,onDragEnter:h,onDragLeave:g,...o,children:r.map(t=>{let n=s.dropZoneHover?.paneId===e&&s.dropZoneHover.pos===t,r=c(t);return(0,C.jsx)(`div`,{className:[b.zone,w[t]].join(` `),"data-testid":`drop-zone-${t}`,"data-position":t,"data-is-hovered":n,onDragOver:r.onDragOver,onDragLeave:r.onDragLeave,onDrop:r.onDrop},t)})})};try{DropZoneProps.displayName=`DropZoneProps`,DropZoneProps.__docgenInfo={description:`Props for the {@link DropZone } component.`,displayName:`DropZoneProps`,filePath:`D:/peter/Projects/pane-craft/src/components/DropZone/DropZone.tsx`,methods:[],props:{},tags:{remarks:`\`DropZone\` is an overlay that sits inside a pane and exposes one of each of\r
the {@link DropZonePosition } regions as tab drop targets. The overlay is\r
invisible and non-interactive while no drag is in progress, and stays\r
invisible while a drag is in flight as long as the pointer is outside the\r
overlay's bounds. The zones fade in only when the pointer enters the\r
overlay during a drag, and highlight whichever zone the pointer is over.\r
\r
The component is headless with respect to the consequences of a drop: it\r
fires \`onDrop\` with the dragged tab and the zone that received it, but\r
never mutates the tab collection or splits the pane itself — that's left to\r
consumer-level logic.`}}}catch{}try{T.displayName=`DropZone`,T.__docgenInfo={description:`An overlay that exposes {@link DropZonePosition} regions inside a pane as
tab drop targets.`,displayName:`DropZone`,filePath:`D:/peter/Projects/pane-craft/src/components/DropZone/DropZone.tsx`,methods:[],props:{className:{defaultValue:{value:``},declarations:[{fileName:`pane-craft/src/types/Base.type.ts`,name:`TypeLiteral`}],description:`Additional CSS class names merged onto the root element.`,name:`className`,required:!1,tags:{},type:{name:`string`}},a11y:{defaultValue:{value:`{}`},declarations:[{fileName:`pane-craft/src/types/Base.type.ts`,name:`TypeLiteral`}],description:`ARIA and accessibility attributes forwarded to the root element.`,name:`a11y`,required:!1,tags:{remarks:`Accepts any valid ARIA attribute (role, aria-*, tabIndex, etc.).\r
This lets consumers compose accessible patterns (e.g. tab lists)\r
without the component needing to know about them.`,example:"```tsx\r\n<Tab a11y={{ role: 'tab', tabIndex: 0, 'aria-selected': isActive }} />\r\n```"},type:{name:`(AriaAttributes & { role?: AriaRole; tabIndex?: number; }) | undefined`}},paneId:{defaultValue:{value:`0`},declarations:[{fileName:`pane-craft/src/types/DropZone.type.ts`,name:`TypeLiteral`}],description:`Identifier of the pane the overlay belongs to.`,name:`paneId`,required:!1,tags:{remarks:"Reported back to the consumer in `onDrop` as `targetPaneId`, and written\r\ninto the shared drag manager via `DropZoneHoverData.paneId` so that\r\ncross-pane drag sessions can distinguish one pane's zones from another's.",default:`0`},type:{name:`number`}},dragAndDropManager:{defaultValue:null,declarations:[{fileName:`pane-craft/src/types/DropZone.type.ts`,name:`TypeLiteral`}],description:`Shared drag state manager.`,name:`dragAndDropManager`,required:!1,tags:{remarks:"Pass the same instance used by the source `TabList`/`StaticTabPane` so the\r\noverlay can see the in-flight drag. When omitted, an internal manager is\r\ncreated — the overlay will never become visible because no drag will\r\noriginate inside it."},type:{name:`DragStateManager`}},onDrop:{defaultValue:null,declarations:[{fileName:`pane-craft/src/types/DropZone.type.ts`,name:`TypeLiteral`}],description:`Called when a dragged tab is dropped on one of this overlay's zones.`,name:`onDrop`,required:!1,tags:{},type:{name:`((data: DropZoneDropPayload) => void)`}},dropZonePosList:{defaultValue:{value:`[\r
  'center',\r
  'top',\r
  'bottom',\r
  'left',\r
  'right',\r
]`},declarations:[{fileName:`pane-craft/src/types/DropZone.type.ts`,name:`TypeLiteral`}],description:`Which zones to render. Useful for panes that should only accept certain
drop actions (e.g. a leaf pane that cannot be split further might pass
\`['center']\` to only accept moves).`,name:`dropZonePosList`,required:!1,tags:{default:`['center', 'top', 'bottom', 'left', 'right']`},type:{name:`readonly DropZonePosition[]`}},edgeSize:{defaultValue:{value:`'30%'`},declarations:[{fileName:`pane-craft/src/types/DropZone.type.ts`,name:`TypeLiteral`}],description:"Size of the edge zones (`top`, `bottom`, `left`, `right`) as a CSS\nlength. `center` fills the remaining area.",name:`edgeSize`,required:!1,tags:{remarks:"Accepts any CSS `<length>` or `<percentage>` value — e.g. `'30%'`,\r\n`'4rem'`, or a custom property reference.",default:`'30%'`},type:{name:`string`}}},tags:{remarks:`\`DropZone\` sits absolutely-positioned inside a pane and renders one of each\r
of the {@link DropZonePosition } regions. The overlay stays invisible and\r
ignores pointer events while no drag is in progress, and it remains\r
invisible while a drag is in flight if the pointer is outside the overlay's\r
bounding box. The zones only fade in once the dragged item enters the\r
overlay, and they highlight whichever zone the pointer is over.\r
\r
The component is headless with respect to the consequences of a drop: it\r
fires \`onDrop\` with the dragged tab and the zone that received it, but\r
never mutates the tab collection or splits the pane itself. The consumer\r
is expected to interpret edge drops as splits and the center drop as a\r
cross-pane move.\r
\r
The host element must be \`position: relative\` (or otherwise a containing\r
block) so that the overlay's \`inset: 0\` fills the pane. The component is\r
designed for consumers to place a single \`DropZone\` as the last child of a\r
\`StaticTabPane\`'s content region.`,example:`Single-pane move-only overlay (no split support):\r
\`\`\`tsx\r
const dragManager = useMemo(() => new DragStateManager(), []);\r
\r
return (\r
  <div style={{ position: 'relative' }}>\r
    <StaticTabPane dragAndDropManager={dragManager} ... />\r
    <DropZone\r
      paneId={0}\r
      dragAndDropManager={dragManager}\r
      dropZonePosList={['center']}\r
      onDrop={({ tab, sourcePaneId }) => moveTab(sourcePaneId, 0, tab)}\r
    />\r
  </div>\r
);\r
\`\`\``,see:`{@link DropZoneProps } for full prop documentation.`}}}catch{}}));export{E as n,T as t};
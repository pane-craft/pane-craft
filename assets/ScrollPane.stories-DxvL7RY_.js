import{n as e}from"./chunk-BneVvdWh.js";import{t}from"./jsx-runtime-D16BNjX-.js";import{a as n,n as r,r as i,t as a}from"./ScrollPane-cskcPJxg.js";var o,s,c,l,u,d,f,p,m,h,g;e((()=>{n(),r(),o=t(),s={title:`Core/ScrollPane`,component:a,parameters:{layout:`centered`},tags:[`autodocs`],argTypes:{orientation:{control:`select`,options:[`horizontal`,`vertical`]},trackClickMode:{control:`select`,options:[`jump`,`increment`]},autoHide:{control:`boolean`}}},c={padding:`8px 12px`,color:`#cccccc`,fontFamily:`Segoe UI, sans-serif`,fontSize:13,lineHeight:1.6},l=e=>(0,o.jsx)(`div`,{style:{width:320,height:48,background:`#1e1e1e`},children:(0,o.jsx)(e,{})}),u=e=>(0,o.jsx)(`div`,{style:{width:240,height:240,background:`#1e1e1e`},children:(0,o.jsx)(e,{})}),d={decorators:[l],args:{orientation:`horizontal`,children:(0,o.jsx)(`div`,{style:{...c,whiteSpace:`nowrap`},children:i(500)})}},f={decorators:[u],args:{orientation:`vertical`,children:(0,o.jsx)(`div`,{style:c,children:i(2e3)})}},p={decorators:[l],args:{orientation:`horizontal`,children:(0,o.jsx)(`div`,{style:c,children:i(17)})}},m={decorators:[l],args:{orientation:`horizontal`,autoHide:!1,children:(0,o.jsx)(`div`,{style:{...c,whiteSpace:`nowrap`},children:i(500)})}},h={decorators:[l],args:{orientation:`horizontal`,trackClickMode:`increment`,autoHide:!1,children:(0,o.jsx)(`div`,{style:{...c,whiteSpace:`nowrap`},children:i(1e3)})}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  decorators: [HORIZONTAL_DECORATOR],
  args: {
    orientation: 'horizontal',
    children: <div style={{
      ...TEXT_STYLE,
      whiteSpace: 'nowrap'
    }}>\r
        {createLoremIpsumText(500)}\r
      </div>
  }
}`,...d.parameters?.docs?.source},description:{story:`Demonstrates horizontal overflow using a long string of generated text.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  decorators: [VERTICAL_DECORATOR],
  args: {
    orientation: 'vertical',
    children: <div style={TEXT_STYLE}>{createLoremIpsumText(2000)}</div>
  }
}`,...f.parameters?.docs?.source},description:{story:`A vertical scroll pane wrapping a large block of generated text.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  decorators: [HORIZONTAL_DECORATOR],
  args: {
    orientation: 'horizontal',
    children: <div style={TEXT_STYLE}>{createLoremIpsumText(17)}</div>
  }
}`,...p.parameters?.docs?.source},description:{story:`When content is short enough to fit, the scrollbar is automatically hidden.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  decorators: [HORIZONTAL_DECORATOR],
  args: {
    orientation: 'horizontal',
    autoHide: false,
    children: <div style={{
      ...TEXT_STYLE,
      whiteSpace: 'nowrap'
    }}>\r
        {createLoremIpsumText(500)}\r
      </div>
  }
}`,...m.parameters?.docs?.source},description:{story:"Disabling `autoHide` keeps the scrollbar visible as long as there is\r\noverflow.",...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  decorators: [HORIZONTAL_DECORATOR],
  args: {
    orientation: 'horizontal',
    trackClickMode: 'increment',
    autoHide: false,
    children: <div style={{
      ...TEXT_STYLE,
      whiteSpace: 'nowrap'
    }}>\r
        {createLoremIpsumText(1000)}\r
      </div>
  }
}`,...h.parameters?.docs?.source},description:{story:`Clicks on the track move the scroll position by increments rather than\r
jumping.`,...h.parameters?.docs?.description}}},g=[`HorizontalOverflow`,`VerticalOverflow`,`NoOverflow`,`AlwaysVisible`,`IncrementInteraction`]}))();export{m as AlwaysVisible,d as HorizontalOverflow,h as IncrementInteraction,p as NoOverflow,f as VerticalOverflow,g as __namedExportsOrder,s as default};
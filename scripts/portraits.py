#!/usr/bin/env python3
"""Regenerate original Five Run pixel portraits from the reviewed trait config."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
config = {}
skins={'light':'#e7ad87','lightbrown':'#b97d5d','medium':'#986045','dark':'#744734'}
haircolors={'blond':'#b78a48','blondlong':'#b78a48','blondpony':'#b78a48','blondbuzz':'#d4ba76','red':'#a85a38','redlong':'#a85a38'}
def rect(x,y,w,h,color,other=''):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{color}"{other}/>'
def svg(name,group):
    skin,style,facial,extra=config[name]
    skin=skins[skin]
    hair=haircolors.get(style,'#241e20')
    background={'G':'#26364b','F':'#3b3449','C':'#34443f'}[group]
    jersey={'G':'#c65f58','F':'#619c9e','C':'#bf9954'}[group]
    a=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" shape-rendering="crispEdges">',rect(0,0,64,64,background),rect(3,4,58,2,'#ffffff',' opacity=".07"')]
    if style in ('long','blondlong','redlong','braids','ponytail','darkpony','blondpony'):
        a += [rect(17,18,30,26,hair)]
        if style in ('ponytail','darkpony','blondpony'): a += [rect(42,21,7,21,hair),rect(45,26,5,13,hair)]
        if style=='braids': a += [rect(15,24,5,19,hair),rect(44,24,5,19,hair),rect(17,39,3,5,'#b58f67'),rect(44,39,3,5,'#b58f67')]
    a += [rect(19,50,26,14,jersey),rect(12,56,40,8,jersey),rect(23,46,18,6,skin),rect(27,50,10,4,skin),rect(19,20,26,22,skin),rect(22,41,20,4,skin),rect(16,25,4,10,skin),rect(44,25,4,10,skin)]
    if style=='bald': a += [rect(22,18,20,4,skin)]
    elif style in ('buzz','blondbuzz'): a += [rect(20,18,24,4,hair),rect(19,21,2,4,hair),rect(43,21,2,4,hair)]
    elif style=='cornrows': a += [rect(19,16,26,7,hair),rect(22,17,2,6,skin,' opacity=".55"'),rect(28,17,2,6,skin,' opacity=".55"'),rect(34,17,2,6,skin,' opacity=".55"'),rect(40,17,2,6,skin,' opacity=".55"')]
    elif style=='afro': a += [rect(16,13,32,11,hair),rect(19,10,26,5,hair),rect(14,17,5,10,hair),rect(45,17,5,10,hair)]
    elif style=='curl': a += [rect(18,16,28,7,hair),rect(21,13,5,4,hair),rect(29,12,5,5,hair),rect(38,13,5,4,hair)]
    else: a += [rect(19,16,26,7,hair),rect(22,13,20,4,hair),rect(19,20,4,5,hair),rect(41,20,4,5,hair)]
    if extra=='headband': a += [rect(18,21,28,3,'#e6e2d5')]
    a += [rect(23,27,5,2,hair),rect(36,27,5,2,hair),rect(24,30,3,3,'#211c1b'),rect(37,30,3,3,'#211c1b'),rect(30,33,4,3,'#5c3d32',' opacity=".55"')]
    if extra=='unibrow': a += [rect(27,26,10,2,hair)]
    if facial=='mustache': a += [rect(27,37,10,3,hair),rect(25,38,2,2,hair),rect(37,38,2,2,hair)]
    elif facial=='goatee': a += [rect(27,37,10,2,hair),rect(28,41,8,3,hair)]
    elif facial in ('fullbeard','shortbeard','stubble'):
        a += [rect(21,36,4,5,hair),rect(39,36,4,5,hair),rect(24,40,16,4,hair),rect(27,37,10,2,hair)]
        if facial=='fullbeard': a += [rect(25,44,14,5,hair),rect(22,40,3,4,hair),rect(39,40,3,4,hair)]
    else: a += [rect(28,39,8,2,'#653f37')]
    if extra=='goggles':
        a += [rect(20,27,11,8,'#c8d9d4'),rect(33,27,11,8,'#c8d9d4'),rect(22,29,7,4,'#647c83'),rect(35,29,7,4,'#647c83'),rect(30,30,4,2,'#c8d9d4')]
    a += [rect(19,52,5,12,'#f1e9d7',' opacity=".5"'),rect(40,52,5,12,'#f1e9d7',' opacity=".5"'),'</svg>']
    return ''.join(a)

entries = json.loads((ROOT / 'scripts/portrait-config.json').read_text())
for player_id, (render_group, skin, hair, facial, accessory, jersey) in entries.items():
    config[player_id] = (skin, hair, facial, accessory)
    art = svg(player_id, render_group)
    default = {'G': '#c65f58', 'F': '#619c9e', 'C': '#bf9954'}[render_group]
    art = art.replace(default, jersey)
    (ROOT / 'public/portraits' / (player_id + '.svg')).write_text(art)
print(f'Generated {len(entries)} portraits.')

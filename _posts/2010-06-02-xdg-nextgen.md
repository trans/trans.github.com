---
title      : XDG Next Generation
author     : trans
categories : [xdg, fhs]
date       : 2010-06-02
layout     : post
published  : false
---

I can never stress enough the value of using the XDG directory standard to
developers. This is one of those standards that can only really benefit us
all if enough developers truly care to make a better eco-system.

I have decided to take two approaches to my encouragment. The first is to
improve the current XDG API to the point of triviality. It will be one script,
which others can copy to their project if they prefer it to having another
dependency. And I will make it even easier to use --one point of entry,
and readily obvious semantics.

But more I have decided to go beyond this and crrate a new standard --a derivation to
the XDG standard that takes an well demonstrated Rails practice into account: convention
over configuration. By doing so the standard can be further simplified and thus 
become even more trivial, and hopfully in this manner become widely supported to 
the benefit of us all.

    ~/.cache
    ~/.config
    ~/.data


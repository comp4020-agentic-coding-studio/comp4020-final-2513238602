# Lost & Found

One missing artwork. Two sides of the story. A short mystery for two people at
the same table, or one curious visitor playing alone.

## What good means here

Good means reaching an explanation together that neither person could confidently
reach from their own folder. The Blue Hour takes place before a fictional gallery
opening. One investigator receives observations and access records; the other
receives administrative documents. They publish clues to a shared desk, arrange
four events, and explain the missing sculpture with supporting evidence.

The important moment is recognition: a partner's detail changes the meaning of
something already on your screen. More content is not automatically better. One
coherent case with eight legible clues is the current scope. Around five minutes
is a design target, not a measured completion time.

## Why this shape

[The Past Within](https://www.rustylake.com/adventure-games/the-past-within.html)
uses different perspectives to make communication part of solving a mystery.
Lost & Found adopts that principle with an original, much smaller case. Here,
location codes and an unreliable camera clock require cross-reading. Neither
cooperative folder contains the complete named person, destination and corrected
time. Solo mode deliberately removes that information boundary so a stranger can
experience the entire interaction without recruiting a partner.

Robin Sloan's [An app can be a home-cooked meal](https://www.robinsloan.com/notes/home-cooked-app/)
offers a useful scale: software can be worthwhile for a few specific people.
This app is for classmates who have a few minutes together. There is no feed,
ranking, account setup, paid content or generated stream of disposable cases.
The conversation happens in person or on a call; the website holds the evidence.

## Promises that can be checked

An investigation is stored on the server. Published evidence, chronology and
attempts survive a browser refresh and a server restart using the same database.
The Fly deployment stores that database on its persistent `/data` volume.
Play the live app at [Lost & Found](https://comp4020-final-2513238602.fly.dev/).
Local running instructions and verification evidence are kept in the repository.

The server checks membership on every room action and event stream. Unpublished
partner clues are not sent to the browser. Concurrent timeline changes cannot
silently overwrite each other: a stale move receives a conflict and the current
state is reloaded. Save feedback follows database confirmation. These promises
belong in the HTTP tests, not just this document.

Every meaningful clue is readable text. The photograph is atmosphere, not a hidden
pixel puzzle. Sorting uses labeled buttons, and the investigation must remain
usable by keyboard and on a narrow phone screen. Live updates use server-sent
events; reconnecting clients retrieve the current authorised state.

## Promises that need people

Automated checks cannot establish that the mystery is satisfying, understandable
or balanced. A first-time pair should contribute from both folders and explain
how their conclusion follows from the evidence. Human playtesting is still
outstanding. Observed confusion should change the clues or interface, not be
explained away by the author.

## Before you begin

Use a nickname. A cookie remembers your browser for 30 days; clearing it loses
access to your investigations. An invitation allows one person to claim the
second seat. Share it only with your partner. Names and shared actions appear
in that investigation's record. Everything in the case is fictional.

This definition was drafted with the coding agent from the approved plan. The
student should review its position and the eventual playtest findings before
course submission.

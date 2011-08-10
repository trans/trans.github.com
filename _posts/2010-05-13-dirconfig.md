---
title      : Directory-based Configuration
author     : Trans
date       : 2010-05-13
categories : [pom, metadata, configuration]
layout     : post
---

With regards to <a href="http://proutils.github.com/pom">POM</a>, 
the most cumbersome issue I have had to struggle with over the course
of its long and somewhat painful development, is the question of
configuration storage. You see, many years ago I hit upon the idea of
using the file system itself as a "hash" for heirarchical storage.
In other words, instead of using a YAML or JSON or an INI file, POM could
use the file system itself.

For example, lets say we have a config file `pom.yaml`:

```yaml
  ---
  name: POM
  summary: Project Object Model for Ruby
  authors:
    - Trans
  sites:
    homepage: http://proutils.github.com/pom
    development: http://github.com/proutils/pom
```

Using the a directory-based configuration system instead
we would have this file hierachy:

```
  pom/
    name
    summary
    authors
    sites/
      homepage
      development
```

And each file would contain the data in plain text given in the YAML example above.

<i>Does this seam crazy to you?</i>. I think, to most developers, this design will simply strike them as some form of mild insanity. However, I also think reason is mostly form a lack of familiarity, not the ideas relative merits. We are not accustomed to utilizing the file system in this fashion, so it is not surprising the initial reactions would be negative. But lets consider the benefits.

To it's advantage, a directory-based configuration does not need a support library to read, parse or write any data. Indeed, any coder can put together a viable system to handle directory-based configs in just a few lines of code. Becuase of this, any language, including shell scripts, can utilize the information. There is no concern that my language of choice won't be able to handle it. It also means that the computer can work with the data very easily, without disrupting the human readability of the same data. Whereas, a YAML file for instance, might become an ugly mess after a program rewrites the file in order to update a single entry. Along the same lines, it becomes very easy to scaffold entries. Copy some files and your good. Old files not specifically copied over remain intact. This "low-bar" of utilily gives directory-based configuration a huge advantage.

But if it is so great, why is it not common place already? Good question. The material cause is that file systems are piss-poor at efficiently storing small files. Even if the file contains a single byte of data most file systems will waste 4K to store it. Becuase of this <i>page size</i> issue the thought of storing many small files <i>on purpose</i> has never been taken seriously. This is changing however. It will be a few more years before the lastest systems are mainstream, but the next generation of file systems (which began I beleive with RieserFS 4) mitigate this problem to the point of irrelevance.

The other major disadvantage it the lack of tools. Because directory-based configuration is not widespread, there are no tools for making it easier to work with data layed out in this fashion. For instance, it is often convenient to edit a group of config options all at once. The best one can with he a directory structure is open a bunch of files simulataneously in a text editor (<code>gedit *</code>) --not an optimal solution. Another example are conversion tools, say converting the data to JSON for transimition via HTTP. To mitigate this we need to create tools that understand the idea of directory-based configuration and give us comfortable interfaces for working with the data within them.

So there are the relative merits, both good and bad, of directory-based configuration storage. If anyone has any others to add I would very muich to hear them. Going on this analysis, I think it is clear that the advantages out weigh the disadvantages since all the disadvantages are becoming or can be mitigated.

However, despite this, I have am seriously considering a move back to a file-based configuration. Why? Becuase directory-based configuration, while arguably better, is simply not common. In 5 to 10 years perhaps it will become more so, but until then it might simply be an design too far ahead of it's time to gain traction with any mainstrean developers. Clearly it is more important that a tool be found useful to a wide audiance, than it utilize a nifty feature, no matter how nifty it might be.


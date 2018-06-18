# AppOps

AppOps provides a system that allows you to manage full-screen, video playback on multiple devices from a single control source. For example, if you have 10 phones or tablets and you want to switch between several videos at a time of your choosing, AppOps can do that.

### Background

The impetus for building this simple system was born from Annie Wang's creative direction for Strange Luggage's performance piece, *Marigram*. For this piece many phones were utilized in playing videos throughput the performance. At times dictated by the pace of the dancer through the piece, the videos were switched. At one interval in the piece, the devices were assigned a video in round-robin fashion from a configured set of 10 variations.

To achieve full-screen while switching videos without requiring any intervention on someone's part, Chrome's [Web App Manifest](https://developers.google.com/web/fundamentals/web-app-manifest/) feature was utilized along with adding the app's URL to the [home screen](https://developer.chrome.com/multidevice/android/installtohomescreen) of each device.

To eliminate any networking issues during the performance -- including preventing attendees from being curious -- a local, private network with a hidden wi-fi SSID was configured without a gateway of any kind; because hey ... security. So while the AppOps solution can definitely play videos from anywhere on the internet, this forced us to serve videos from a server on the private network.

To eliminate one other complication that would require intervention on already configured devices, a hostname was configured for the Media Server that the app on each phone would connect to. Since the private network had no gateway and thus no access to a DNS server, a very simple DNS server was run locally and the router configured to point to it. This DNS server was then configured to answer with a single IP address regardless of the hostname in the query.

In the end, all of the servers were run from a single laptop:

* Media Server - serving videos and the web app's content (HTML, JS, CSS, etc.)
* Control Server - controlling video playback across connected devices
* LocalDNS - DNS server for the private network

### Limitations

This system is known to work with fairly recent Android devices -- at least Android 7, though some older versions should also work -- and with a modern version of Chrome (v67.x in this case). It has not been thoroughly tested in any other setup. Specifically for the performance, [ZTE ZFIVE](https://www.zteusa.com/zfive-g) devices were used, simply because they were cheap and modern enough. Though a few other Android devices were thrown into the mix -- the Nexus 5X for instance -- the ZFIVE was predominantly used.

No work was put into ensuring that playback across devices remained "perfectly" in-sync. Due to various reasons: device specifications, network latency, etc. playback position can (and probably will) variate between devices. For the *Marigram* performance, this was actually a feature.

## Setup & Usage

In all cases, you will need to have the latest version of direnv. So do that. Install it. Once direnv is installed, run the following from the root of this cloned repo:

```sh
$ direnv allow .
 ```

Doing so will tell you what other dependencies (deps) you are missing. Make sure to install those deps.

Once all deps are installed -- namely: nodejs, npm, and nginx -- run `direnv allow .` again. If those deps are indeed installed, that last command will automatically install any production node modules deemed required in package.json. This step will also have added the `bin` directory to your path, so long as your terminal is somewhere in the repo's file path.

You are now ready to run stuff.

When setting things up for local testing, you will only need to run the Media Server and the Control Server; LocalDNS is useful in a more advanced setting.

### Media Server

Media Server is where videos and your "app" will be served from; it's basically just some nginx config. Assuming you have already installed nginx for your OS (you shouldn't need any special modules), you just need to run the server. Because the repo's `bin` dir was added to your PATH (via direnv), you can start it like so:

```sh
$ media-server start
```

This will start nginx as a daemon and bind an HTTP listener to port `8080`. This (and a few other things) are configurable in the `etc/conf.sh` script as the `HTTP_PORT` variable. If you change the port to anything less than `1024` you will need to have sudo privileges when starting the Media Server.

To stop Media Server:

```sh
$ media-server stop
```

Media Server expects to serve any local video files from the `media` directory. Initially, in this directory you will see only `blank.webm`. You can use this yourself if you like for playing a black/blank screen. Any other files you put in the `media` directory will be ignored by git.

You can access `.mov`, `.mp4`, and `.webm` files via a browser like so: `http://localhost:8080/stop.webm`. Any path starting with `/ws/` will be proxied to the Control Server. All other requests will be served from the `public` dir of this repo.

You can find log files for nginx in the `var/log` dir of this repo. Do make sure to use the `media-server` script as it utilizes the configuration from `etc/conf.sh` when running nginx. I suggest poking around the script to see what it's doing.

### Control Server

Control is the thing that will run on your laptop/device to manage what videos your connected devices should be displaying. Running it is dead simple:

```sh
$ control-server
```

There is no `start` or `stop` option since this currently runs in the foreground in your terminal. So, to stop it you'll need to `CTRL+C` out of it.

By default, the Control Server will listen on port `8010` for WebSocket connections. You can change this by editing the `WEBSOCKET_PORT` variable in `etc/conf.sh`, though this is probably unnecessary. If you do change this setting, you will need to stop and start the Media Server as it expects to proxy requests starting with `/ws/` to the Control Server.

You should start Control Server before connecting any devices with the "app"; though again, this is not strictly necessary. Control Server writes to a log file in `var/log` as well.

### Connecting devices and controlling playback

First, start Media Server and Control Server. Next, open a browser to [localhost:8080](http://localhost:8080) and you should see a black screen. Now, in the terminal window where you are running Control Server, arrow down to "Big Buck Bunny" and your browser should start playing that video. You won't hear anything as the volume has been turned to zero. The video should loop automatically when it reaches the end. At any point, you can switch to another video.

From here, you can open another tab in your browser or use your phone's browser to connect to localhost:8080; if you're connecting from your phone, you will need the IP address of the device you are running the Media Server from. You now have multiple clients connected to Control Server; if you now switch to the "Chromecast Ads" video, each device will be assigned a different URL from the configured array. The entire configuration of video options is defined in `etc/control.conf.json` (and in `etc/example.conf.json` for reference).

Chromecast Ads has 5 different videos in its configuration. So, if you had 5 devices connected, they would each be assigned a different URL from that list. If you connected a 6th, it would be assigned the first video from the list; add a 7th and it would be assigned the second video; and so on in round-robin fashion.

When switching between videos, every device will start playback at the `position` configured in `etc/control.conf.json` for that video. The `position` setting is in millisecond units; so if you wanted to start playing at 15 seconds into the video, set `position` to 15000, which is what happens with the "Tears of Steel" video.

If you don't want the video to play when it loads, set `autoPlay` to false for that video. At the moment, this only useful for the blank screen option since there is no way to play a stopped video yet.

At this point, edit `etc/control.conf.json` to suit your needs, restart Control Server, and you're on your way.

### LocalDNS

LocalDNS is useful in the private network environment where you just want to define a single host and have it point to some private IP address. The default IP is `192.168.0.100`, but you can configure it by editing the `LOCALDNS_STATICIP` variable in `etc/conf.sh`. Ostensibly, a router will use LocalDNS as its only DNS server; when you want this, you will want to change `LOCALDNS_PORT` to `53` in `etc/conf.sh` if you're going to use it. Otherwise it's default port is `5300`.

Starting the DNS server:

```sh
$ localdns start
```

You can test that it's working pretty easily:

```sh
$ dig +short @localhost -p 5300 foo.bar A
# 192.168.0.100
$ dig +short @localhost -p 5300 some.host.name A
# 192.168.0.100
```

LocalDNS will answer with the configured static-ip for any and all hostnames. It will not do any DNS proxying. You can tail its log at `var/log/localdns.log`.

Stopping the server is as you would expect:

```sh
$ localdns stop
```

## TODO

1. Allow late-starting clients to start at a position in the video close to the current position of other videos. Thinking the best way might be to listen to heartbeat status updates from multigram in Control. Control can then manage the average playback position and send that up with any newly connecting clients.

- tracking per-client position of playback
- position newly attached clients to average playback position of already attached clients
- provide option to set configure this feature per video
- deal with video loopings
- possibly ignore position for open clients that haven't been updated recently

2. Allow auto-switching based on a timer.

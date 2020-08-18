class WallpaperAutomat {
    static init() {
        WallpaperAutomat.parser = new DOMParser();
        WallpaperAutomat.ranks = null;
        WallpaperAutomat.j = 0;
        WallpaperAutomat.outputLoc = document.getElementById("output-console");
        WallpaperAutomat.imageW = 0;
        WallpaperAutomat.imageH = 0;
        WallpaperAutomat.dlRefreshcounter = 0;
        WallpaperAutomat.xhr = new XMLHttpRequest();

        WallpaperAutomat.minW = 0;
        WallpaperAutomat.minH = 0;
        WallpaperAutomat.subreddits = null;

        WallpaperAutomat.currentSubIndex = 0;
        WallpaperAutomat.imageHandle = document.getElementById("image-hole");

        WallpaperAutomat.url = "";
        WallpaperAutomat.pos = 0;
        WallpaperAutomat.countMult = 0; 
        WallpaperAutomat.postName = "";
        WallpaperAutomat.outp = "";
        WallpaperAutomat.loadTimeout = null;

        WallpaperAutomat.trustedDomains = ["i.redd.it", "i.imgur.com"];
    }

    static checkImage() {
        var htmlStr = "<p><a href=";
        WallpaperAutomat.download();
        WallpaperAutomat.waiting = true;
        
        WallpaperAutomat.imageHandle.onload = () => {
            clearTimeout(WallpaperAutomat.loadTimeout);
            setTimeout(() => {
                WallpaperAutomat.imageH = WallpaperAutomat.imageHandle.height;
                WallpaperAutomat.imageW = WallpaperAutomat.imageHandle.width;
                if(WallpaperAutomat.imageW>=WallpaperAutomat.minW && WallpaperAutomat.imageH>=WallpaperAutomat.minH) {
                    if (!WallpaperAutomat.checkDomain()) htmlStr = "<p><a class='unknownDomain' title='Uncommon URL, be wary of clicking!' href=";
                    WallpaperAutomat.outputLoc.innerHTML += htmlStr + WallpaperAutomat.outp + " target='_blank' rel='noopener noreferrer'>" + WallpaperAutomat.postName + " [" + WallpaperAutomat.imageW + ":" + WallpaperAutomat.imageH  + "]</a></p>";
                }
                    
                WallpaperAutomat.j++;
                WallpaperAutomat.parseRank();
            }, 100);            
        };

        WallpaperAutomat.imageHandle.src = "output." + WallpaperAutomat.outp.substring(WallpaperAutomat.outp.length-3, WallpaperAutomat.outp.length) + "?dlrefresh=" + WallpaperAutomat.dlRefreshcounter;
        WallpaperAutomat.dlRefreshcounter++;

        WallpaperAutomat.loadTimeout = setTimeout(() => {
            WallpaperAutomat.imageHandle.onload = null;
            WallpaperAutomat.j++;
            WallpaperAutomat.parseRank();
        }, 30000);
    }

    static download() {
        if (!WallpaperAutomat.xhr) {
            console.error("HTTP request not instantiated!");
            return;
        }

        var param = "inputURL=" + WallpaperAutomat.outp + "&countMult=0&pos=0&dlImg=1";

        WallpaperAutomat.xhr.onreadystatechange = () => {
            if (WallpaperAutomat.xhr.readyState == 4) {
                if (WallpaperAutomat.xhr.status!=200) {
                    console.error("requestDL status = " + WallpaperAutomat.xhr.status);
                    return false;
                } else {
                    return true;
                }                
            }
        }

        WallpaperAutomat.xhr.open("POST", "trawl-func.php", true);

        WallpaperAutomat.xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        WallpaperAutomat.xhr.send(param);

    }

    static httpGet() {
        if (!WallpaperAutomat.xhr) {
            console.error("HTTP request not instantiated!");
            return;
        }
    
        var param = "inputURL=" + WallpaperAutomat.url + "&countMult=" + WallpaperAutomat.countMult + "&pos=" + WallpaperAutomat.pos + "&dlImg=0";
    
        WallpaperAutomat.xhr.onreadystatechange = () => {
            if (WallpaperAutomat.xhr.readyState == 4) {
                if (WallpaperAutomat.xhr.status!=200) {
                    console.error("Request status = " + WallpaperAutomat.xhr.status);
                    return;
                } else {
                    let htmlDoc = WallpaperAutomat.parser.parseFromString(WallpaperAutomat.xhr.responseText, "text/html");
                    WallpaperAutomat.ranks = htmlDoc.getElementsByClassName("rank");
                    WallpaperAutomat.parseRank();
                }
                
            }
        }
    
        WallpaperAutomat.xhr.open("POST", "trawl-func.php", true);
    
        WallpaperAutomat.xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    
        WallpaperAutomat.xhr.send(param);
    }

    static parseRank() {
        if (WallpaperAutomat.ranks.length<1) {
            if (WallpaperAutomat.currentSubIndex < WallpaperAutomat.subreddits.length) {
                WallpaperAutomat.runSearch();
                return; // search required
            }
            WallpaperAutomat.outputLoc.innerHTML += "<p class='end-of-search'>All entries have been checked. End of operation.</p>";
            console.log("All entries have been checked. End of operation.");
            return;     
        }
        if (WallpaperAutomat.j < WallpaperAutomat.ranks.length) {
            WallpaperAutomat.pos = WallpaperAutomat.ranks[WallpaperAutomat.j].parentNode.id.substring(6, 15);
            WallpaperAutomat.postName = WallpaperAutomat.ranks[WallpaperAutomat.j].parentNode.getElementsByClassName("title")[1].innerText;
            console.log("Evaluating for target resolution: " + WallpaperAutomat.postName);
            WallpaperAutomat.outp = WallpaperAutomat.ranks[WallpaperAutomat.j].parentNode.dataset.url;
            if (WallpaperAutomat.outp.substring(WallpaperAutomat.outp.length-3, WallpaperAutomat.outp.length)=="png" || WallpaperAutomat.outp.substring(WallpaperAutomat.outp.length-3, WallpaperAutomat.outp.length)=="jpg")
                WallpaperAutomat.checkImage()
            else {
                WallpaperAutomat.j++;
                setTimeout(WallpaperAutomat.parseRank, 100);
            }
        } else {
            console.log("----------------------------------------------------------------");
            WallpaperAutomat.j = 0;
            WallpaperAutomat.countMult +=25;
            WallpaperAutomat.httpGet();
            return;     
        }
    }

    static runSearch() {
        WallpaperAutomat.url = 'https://old.reddit.com/r/' + WallpaperAutomat.subreddits[WallpaperAutomat.currentSubIndex] + '/top';
    
        WallpaperAutomat.pos = "0";
        WallpaperAutomat.countMult=0;
        WallpaperAutomat.currentSubIndex++;
        
        WallpaperAutomat.httpGet();
    }

    static find(x, y, ...inputGroup) {
        WallpaperAutomat.minW = x;
        WallpaperAutomat.minH = y;
        WallpaperAutomat.subreddits = inputGroup;
        WallpaperAutomat.currentSubIndex = 0;

        WallpaperAutomat.outputLoc.innerHTML = "";
        
        WallpaperAutomat.runSearch();
    }

    static checkDomain() {
        let urlOffset = 7;
        if (WallpaperAutomat.outp[4].toLowerCase() == 's') urlOffset = 8;
        for (let i = 0; i < WallpaperAutomat.trustedDomains.length; i++) {
            if (WallpaperAutomat.trustedDomains[i].length < WallpaperAutomat.outp.length)
                if (WallpaperAutomat.outp.substring(urlOffset, WallpaperAutomat.trustedDomains[i].length + urlOffset).toLowerCase() == WallpaperAutomat.trustedDomains[i]) return true;
        }
        return false;
    }
}

WallpaperAutomat.init();
window.alert('open the developer console (usually F12), enter the command WallpaperAutomat.find([width], [height], [subreddits - any quantity - comma seperated]) -- eg: WallpaperAutomat.find(1920, 1080, "spacewallpapers", "spacepics"), then close the developer window AND this message box; the webpage will fill with links to images that can be (cropped and) used as a desktop wallpaper. Note that in subreddits that typically do not have hi-res images, this can take time.');

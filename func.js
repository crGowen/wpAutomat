parser = new DOMParser();
ranks = false;
j=0;
outputLocID = "output-console";
postName = "";
imageW = "";
imageH = "";
pos = "0";
countMult=0;
DlRefreshcounter=0;
xhr = new XMLHttpRequest();

minW = 1920;
minH = 1080;
subreddit = 'spacewallpapers';
imageHandle = $id("image-hole");

/* code was never intended to be anything major, but since all these changes have gone into it, a code refactor and ESnext update is in order (sometime) */

function HttpGet() {  
    if (!xhr) {
        console.error("request not instantiated!");
        return;
    }

    param = "inputURL=" + url + "&countMult=" + countMult + "&pos=" + pos + "&dlImg=0";

    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4) {
            if (xhr.status!=200) {
                console.error("request status = " + xhr.status);
            } else {
                htmlDoc = parser.parseFromString(xhr.responseText, "text/html");             
                ranks = htmlDoc.getElementsByClassName("rank");
                ParseRank();
            }
            
        }
    }

    xhr.open("POST", "trawl-func.php", true);

    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhr.send(param);
}

function Download(inUrl) {
    //imageHandle.src = "";
    if (!xhr) {
        console.error("requestDL not instantiated!");
        return;
    }

    param = "inputURL=" + inUrl + "&countMult=0&pos=0&dlImg=1";

    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4) {
            if (xhr.status!=200) {
                console.error("requestDL status = " + xhr.status);
            } else {
                setTimeout(()=>{EvalPic(outp, true);}, 600);             
            }
            
        }
    }

    xhr.open("POST", "trawl-func.php", true);

    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhr.send(param);
}

function ParseRank(){
    if (ranks.length<1) {
        if (currrentSub < subreddits.length) {
            RunSearch();
        } else {
            $id("output-console").innerHTML += "<p class='end-of-search'>All entries have been checked. End of operation.</p>";
            console.log("All entries have been checked. End of operation.");
        }        
        return;
    }
    if (j<ranks.length) {
        pos = ranks[j].parentNode.id.substring(6, 15);
        postName = ranks[j].parentNode.getElementsByClassName("title")[1].innerText;
        console.log("Evaluating for target resolution: " + postName);
        outp = ranks[j].parentNode.dataset.url;
        if (!outp.includes("https://i.redd.it")) {
            if (outp.substring(outp.length-3, outp.length)=="png" ||outp.substring(outp.length-3, outp.length)=="jpg") Download(outp);
            else {
                j++;
                ParseRank();
            }
        } 
        else {
            if (outp.substring(outp.length-3, outp.length)=="png" ||outp.substring(outp.length-3, outp.length)=="jpg") EvalPic(outp, false);
            else {
                j++;
                ParseRank();
            }
        }
    } else {
        console.log("----------------------------------------------------------------");
        j = 0;
        countMult +=25;
        HttpGet(url);        
    }    
}

function EvalPic(k, evalFromDl){
    if (!evalFromDl) imageHandle.src = k;
    else {
        imageHandle.src = "output." + k.substring(k.length-3, k.length) + "?dlrefresh=" + DlRefreshcounter;
        DlRefreshcounter++;
    }
    setTimeout(()=>{
        imageH = imageHandle.height;
        imageW = imageHandle.width;
        if(imageW>=minW && imageH>=minH) $id("output-console").innerHTML += "<p><a href=" + k + " target='_blank' rel='noopener noreferrer'>" + postName + " [" + imageW + ":" + imageH  + "]</a></p>";
        j++;
        ParseRank();
    }, 800);
}

function RunSearch() {
    url = 'https://old.reddit.com/r/' + subreddits[currrentSub] + '/top';

    pos = "0";
    countMult=0;
    currrentSub++;
    HttpGet();
}

function RunImageGather(x, y, ...inputGroup) {
    subreddits = inputGroup;
    currrentSub = 0;
    minW = x;
    minH = y;
    $id("output-console").innerHTML = "";
    RunSearch();
}

window.alert('open the developer console (usually F12), enter the command RunImageGather([width], [height], [subreddits - any quantity - comma seperated]) -- eg: RunImageGather(1920, 1080, "spacewallpapers", "spacepics"), then close the developer window AND this message box; the webpage will fill with links to images that can be (cropped and) used as a desktop wallpaper. Note that in subreddits that typically do not have hi-res images, this can take time.');

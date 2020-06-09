<?php
    $url = $_POST['inputURL'];
    $pos = $_POST['pos'];
    $cn = $_POST['countMult'];
    $dl = $_POST['dlImg'];





    if($dl) copy($url, "output.".substr($url, -3));
    else {
        $url = $url."/?sort=top&t=all";
        if ($cn) {
            $url = $url."&count=".urlencode($cn)."&after=".urlencode($pos);
        }
        $r = file_get_contents($url);
        echo $r;
    }
?>

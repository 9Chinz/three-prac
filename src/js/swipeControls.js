export default function swipedetect(el, callback) {
    var touchsurface = el,
        swipedir,
        startX,
        startY,
        distX,
        distY,
        angle,
        speed,
        threshold = 0,
        restraint = 1000,
        allowedTime = 1000,
        elapsedTime,
        startTime,
        handleswipe = callback || function (swipedir) { }

    touchsurface.addEventListener('touchstart', function (e) {
        var touchobj = e.changedTouches[0]
        swipedir = 'none'
        startX = touchobj.pageX
        startY = touchobj.pageY
        startTime = new Date().getTime() // record time when finger first makes contact with surface
        e.preventDefault()
    }, false)

    touchsurface.addEventListener('touchmove', function (e) {
        e.preventDefault() // prevent scrolling when inside DIV
    }, false)

    touchsurface.addEventListener('touchend', function (e) {
        var touchobj = e.changedTouches[0]
        distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
        distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface
        elapsedTime = new Date().getTime() - startTime // get time elapsed
        angle = Math.atan(distY/distX)
        speed = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2)) / elapsedTime
        //console.log(`x${distX} y${distY}`)
        if (elapsedTime <= allowedTime) { // first condition 

            if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) { // 2nd condition for vertical swipe met
                if (distY <= 0){
                    //console.log(`angle ${angle}`)
                    //console.log(`speed ${speed}`)
                    if (Math.abs(angle) >= 1.3){
                        if (speed >= 2){
                            swipedir = 'fastTopFar'
                        }else{
                            swipedir = 'fastTop'
                        }
                    }else if (angle > 0.6){
                        if (speed >= 2){
                            swipedir = 'fastLeftFar'
                        }else if (speed >= 1.2){
                            swipedir = 'fastLeft'
                        }else{
                            swipedir = 'slowLeft'
                        }                   
                    }else if (angle < -0.6){

                        if (speed >= 2){
                            swipedir = 'fastRightFar'
                        }else if (speed >= 1.2){
                            swipedir = 'fastRight'
                        }else{
                            swipedir = 'slowRight'
                        }    
                    }

                }
            }

        }
        handleswipe(swipedir)
        e.preventDefault()
    }, false)
}
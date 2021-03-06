// demo5.js
// Spheres bouncing around a room. Walls are animated when they are hit
// The room is centered around (x,y,z) = (0,0,0)
//
(function() {

    var camera, scene, renderer, spheres = [], planes = {},
        windowWidth = window.innerWidth-100,
        windowHeight = window.innerHeight-100,
        windowDepth = 1000,
        maxwidth = windowWidth/2,
        maxheight = windowHeight/2,
        maxdepth = windowDepth/2,
        sphereRadius = 30,
        planeStartTime = 400,
        planeStartOpacity = 0.4,
        animating = false;

    var planeLocation = {
        LEFT: 0,
        RIGHT: 1,
        TOP: 2,
        BOTTOM: 3,
        BACK: 4
    };
    
    function plane( mesh ) {
        this.mesh = mesh;
        this.timeleft = planeStartTime;
    
        this.reset = function () {
            this.timeleft = planeStartTime;
            this.mesh.material.opacity = planeStartOpacity;
        }
    
        this.updateMesh = function( elapsed ) {
            // First check if there is still time left in the animation
            if (this.timeleft > 0)
                this.timeleft -= elapsed;
            
            // After potential subtraction of the elapsed time, check again
            if (this.timeleft > 0) {
                // Opacity is a linear function of the time that is left of the animation
                // opacity = originalOpacity * timeleft / starttime
                this.mesh.material.opacity = planeStartOpacity + (1.0 - planeStartOpacity) * (this.timeleft / planeStartTime);
            }
            else {
                this.mesh.material.opacity = planeStartOpacity;
            }
        }
    }
    
    function sphere( mesh ) {
        this.mesh = mesh;
        this.direction = [ 
            Math.round(Math.random()) == 1 ? 1 : -1, 
            Math.round(Math.random()) == 1 ? 1 : -1,
            Math.round(Math.random()) == 1 ? 1 : -1
        ];
    
        this.speed = Math.random() * 200 + 400; // Pixels per millisecond
    
        this.updatePosition = function (elapsed) {
            this.mesh.position.x += this.direction[0] * (elapsed / 1000.0 * this.speed);
            this.mesh.position.y += this.direction[1] * (elapsed / 1000.0 * this.speed);
            this.mesh.position.z += this.direction[2] * (elapsed / 1000.0 * this.speed);
        }
    
        this.updateCollision = function() {
            if (this.mesh.position.x >= (maxwidth-sphereRadius)) {
                hitPlane(planeLocation.RIGHT);
                this.direction[0] = -1;
                this.direction[1] *= Math.pow(-1, (int)(Math.random() * 2));
            }
            else if (this.mesh.position.x <= -(maxwidth-sphereRadius)) {
                hitPlane(planeLocation.LEFT);
                this.direction[0] = 1;
                this.direction[1] *= Math.pow(-1, (int)(Math.random() * 2));
            }
    
            if (this.mesh.position.y >= (maxheight-sphereRadius)) {
                hitPlane(planeLocation.TOP);
                this.direction[1] = -1;
                this.direction[2] *= Math.pow(-1, (int)(Math.random() * 2));
            }
            else if (this.mesh.position.y <= -(maxheight-sphereRadius)) {
                hitPlane(planeLocation.BOTTOM);
                this.direction[1] = 1;
                this.direction[2] *= Math.pow(-1, (int)(Math.random() * 2));
            }
    
            if (this.mesh.position.z >= maxdepth) {
                this.direction[2] = -1;
                this.direction[0] *= Math.pow(-1, (int)(Math.random() * 2));
            }
            else if (this.mesh.position.z <= -maxdepth) {
                hitPlane(planeLocation.BACK);
                this.direction[2] = 1;
                this.direction[0] *= Math.pow(-1, (int)(Math.random() * 2));
            }
        }
    
    }
    
    function init() {
    
        scene = new THREE.Scene();
    
        camera = new THREE.PerspectiveCamera( 75, windowWidth / windowHeight, 1, 10000 );
        camera.position.z = 1000;
    
        // The light is at the upper right corner of the room.
        var pointLight = new THREE.PointLight(0xffffff);
        pointLight.position.x = maxwidth - 50;
        pointLight.position.y = maxheight - 50;
        pointLight.position.z = maxdepth - 50;
        scene.add( pointLight );
        
        for (var i = 0; i < 1; i++) {
            var geometry = new THREE.SphereGeometry( sphereRadius, 10, 10);
            var material = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
        
            spheres[i] = new sphere ( new THREE.Mesh( geometry, material ) );
    
            scene.add( spheres[i].mesh );
        }
    
        initPlanes();
    
        renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize( windowWidth, windowHeight );
    
        var renderarea = document.getElementById('render-area');
        // Remove all existing nodes.
        while (renderarea.firstChild) {
            renderarea.removeChild(renderarea.firstChild);
        }
        renderarea.appendChild( renderer.domElement );
    
        lastTime = new Date();
    }
    
    function initPlanes() {
        initPlane(planeLocation.TOP);
        initPlane(planeLocation.BOTTOM);
        initPlane(planeLocation.RIGHT);
        initPlane(planeLocation.LEFT);
        initPlane(planeLocation.BACK);
    }
    
    function initPlane( planeLoc ) {
        var w, h, posx = 0, posy = 0, posz = 0, rotx = 0, roty = 0, rotz = 0;
    
        switch (planeLoc) {
            case planeLocation.BACK:
                w = windowWidth;
                h = windowHeight;
                posz = -maxdepth; 
                break;
            case planeLocation.LEFT:
                w = windowDepth;
                h = windowHeight;
                posx = -maxwidth;
                roty = Math.PI/2;
                break;
            case planeLocation.RIGHT:
                w = windowDepth;
                h = windowHeight;
                posx = maxwidth;
                roty = -Math.PI/2;
                break;
            case planeLocation.BOTTOM:
                w = windowWidth;
                h = windowDepth;
                posy = -maxheight;
                rotx = -Math.PI/2;
                break;
            case planeLocation.TOP:
                w = windowWidth;
                h = windowDepth;
                posy = maxheight;
                rotx = Math.PI/2;
                break;
        }
    
        geometry = new THREE.PlaneGeometry( w, h );
        material = new THREE.MeshLambertMaterial( { color: 0x0000ff, opacity: planeStartOpacity, transparent: true } );
        planeMesh = new THREE.Mesh( geometry, material );
        planeMesh.position.x = posx;
        planeMesh.position.y = posy;
        planeMesh.position.z = posz;
        planeMesh.rotation.x = rotx;
        planeMesh.rotation.y = roty;
        planeMesh.rotation.z = rotz;
    
        var thePlane = new plane ( planeMesh );
        planes[planeLoc] = thePlane;
        
        scene.add( thePlane.mesh );
    }
    
    function hitPlane(planeLoc) {
        planes[planeLoc].reset();
    }
    
    var lastTime = 0;
    
    function animate() {
        if (animating) {
            var now = new Date();
            var elapsed = now.getTime() - lastTime.getTime();
            lastTime = now;
    
            for (var i = 0; i < spheres.length; i++) {
                spheres[i].updateCollision();
                spheres[i].updatePosition( elapsed );
            }
    
            for (var i in planes) {
                planes[i].updateMesh( elapsed );
            }
    
            // note: three.js includes requestAnimationFrame shim
            window.animationId = requestAnimationFrame( animate );
            render();
        }
    }
    
    function render() {
        renderer.render( scene, camera );
    }

    var Demo5 = function() {};

    Demo5.prototype.start = function() {
        if (window.animationId !== null)
            cancelAnimationFrame(window.animationId);
        init();
        animating = true;
        animate();
    }

    Demo5.prototype.stop = function() {
        animating = false;
    }

    window.Demo5 = new Demo5();

})();

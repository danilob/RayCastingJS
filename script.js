var textarea = document.getElementById("code");
var canvas = document.getElementById("render-canvas");
var ctx = canvas.getContext("2d");
var aspect = canvas.width / canvas.height;

//valores da projeção
var near = 0.1;
var far = 1000.;
var angle = 45;
var stop = false;
var objects = [];
var background = new Vec3(0 / 255., 0 / 255., 0 / 255.);

const get = e => document.querySelector(e); //obtém um elemento

point_intersection = null;

//TODO:coloque uma função para especificar a câmera via interface
var camera = new Camera();
camera.eye = new Vec3(0, 0, 15.);
camera.at = new Vec3(0, 0, 0);
camera.up = new Vec3(0, 1., 0);

function setCamera(_eye = new Vec3(0, 0, 15.), _at = new Vec3(0, 0, 0), _up = new Vec3(0, 1., 0)) {
    camera.eye = _eye;
    camera.at = _at;
    camera.up = _up;
}

/* new function */
function setProjection(_angle = 45, _near = 0.1, _far = 1000) {
    near = _near;
    far = _far;
    angle = _angle;
}

function updateScene() {
    restart();
    eval(textarea.value);
}

function restart() {
    objects = [];
}

function addObject(obj) {
    objects.push(obj);
}

//define o tamanho da janela
function sizeWindow(w, h) {
    canvas.height = h;
    canvas.width = w;
    aspect = canvas.width / canvas.height;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateProgress(percent) {
    const displayProgress = get("#progress");
    const displayConcluded = get("#concluded");
    displayProgress.classList.remove("hidden");
    displayConcluded.style.setProperty('width', `${percent}%`, 'important');
    if (percent === 100) {
        displayProgress.classList.add("hidden");
        displayConcluded.style.setProperty('width', `0%`, 'important');
    }
}

textarea.addEventListener("input", updateScene());

async function calculateIntersection(ray, i, j) {
    var Vec = new Vec3();
    var intercept = false;
    var best_result = undefined;
    for (var k = 0; k < objects.length; k++) {
        var shape = objects[k];
        //raio transformado em coordenadas do mundo
        var ray_w = new Ray(multVec4(camera.lookAt(), ray.o), multVec4(camera.lookAt(), ray.d));
        var result = shape.testIntersectionRay(ray_w);
        //TODO: verificar onde ocorreu a menor interseção
        if (result[0] && (best_result === undefined || result[3] < best_result[3])) {
            best_result = result
            intercept = true;
            var position = result[1];
            var normal = result[2];
            var viewer = camera.eye;
            //TODO: fazer o cálculo de phong e setar na variável colorF
            //var colorF = new Vec3(228 / 255., 44 / 255., 100 / 255.);
            colorF = phongColor(position, normal, viewer);
            ctx.fillStyle = "rgb(" + Math.min(colorF.x, 1) * 255 + "," + Math.min(colorF.y, 1) * 255 + "," + Math.min(colorF.z, 1) * 255 + ")";
            ctx.fillRect(i, j, 1, 1);

        }
    }


    if (!intercept) {
        ctx.fillStyle = `rgb(${background.x},${background.y},${background.z})`;
        ctx.fillRect(i, j, 1, 1);
    }



}



async function renderCanvas() {
    updateScene();
    stop = true;
    max_rays = canvas.width * canvas.height;
    actual_ray_count = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.beginPath();
    hl = 2 * near * Math.tan(angle * Math.PI / 360.);
    wl = hl * aspect;

    deltaY = hl / canvas.height;
    deltaX = wl / canvas.width;


    await updateProgress(0);

    for (var i = 0; i < canvas.width; i++) {
        for (var j = 0; j < canvas.height; j++) {
            var xc = -wl / 2 + deltaX / 2 + i * deltaX;
            var yc = -(-hl / 2 + deltaY / 2 + j * deltaY);
            var point = new Vec3(xc, yc, -near);

            var o = new Vec3(0, 0, 0); //origem de câmera
            var d = new Vec3(point.x, point.y, point.z);
            ray = new Ray(o, new Vec3().minus(d, o));
            calculateIntersection(ray, i, j);
            actual_ray_count++;
            if ((i * j + 1) % ((canvas.width * canvas.height) / 50) == 0) {
                await updateProgress(actual_ray_count / max_rays * 100);
                await sleep(100);
            }


        }
    }
    await updateProgress(100);
    stop = false;

}

var save = document.getElementById("save");

// Save | Download image
function downloadImage(data, filename = 'untitled.jpeg') {
    var a = document.createElement('a');
    a.href = data;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
}

save.addEventListener("click", function() {
    // var fullQuality = canvas.toDataURL('image/png', 1.0);
    // window.location.href = fullQuality;
    var canvas = document.querySelector('#render-canvas');

    var dataURL = canvas.toDataURL("image/jpeg", 1.0);

    downloadImage(dataURL, 'my-canvas.jpeg');
});
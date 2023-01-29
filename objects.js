function Ray(o, d) {
    this.o = o; //origem
    this.d = d; //direção do raio
    this.d.w = 0;
}

Ray.prototype.show = function() {
    console.log("O" + "(" + this.o.x + "," + this.o.y + "," + this.o.z + "," + this.o.w + ")" + ", d = " + "(" + this.d.x + "," + this.d.y + "," + this.d.z + "," + this.d.w + ")")
}

Ray.prototype.get = function(t) {
    return new Vec3().sum(this.o, this.d.prod(this.d, t));
}


function Vec3() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = 1;
}

function Vec3(x, y, z, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
}

Vec3.prototype.set = function(v) {
    this.x = v;
    this.y = v;
    this.z = v;
}

Vec3.prototype.set = function(x, y, z, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
}
Vec3.prototype.sum = function(p1, p2) {
    return new Vec3(p1.x + p2.x, p1.y + p2.y, p1.z + p2.z);
}
Vec3.prototype.minus = function(p1, p2) {
    return new Vec3(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
}
Vec3.prototype.dot = function(p1, p2) {
    return p1.x * p2.x + p1.y * p2.y + p1.z * p2.z;
}
Vec3.prototype.cross = function(p1, p2) {
    return new Vec3(p1.y * p2.z - p1.z * p2.y, -(p1.x * p2.z - p1.z * p2.x), p1.x * p2.y - p1.y * p2.x);
}
Vec3.prototype.module = function(p) {
    return Math.sqrt(this.dot(p, p));
}
Vec3.prototype.div = function(p, k) {
    return new Vec3(p.x / k, p.y / k, p.z / k);
}
Vec3.prototype.prod = function(p, k) {
    return new Vec3(p.x * k, p.y * k, p.z * k);
}
Vec3.prototype.compond = function(p, p0) {
    return new Vec3(p.x * p0.x, p.y * p0.y, p.z * p0.z);
}
Vec3.prototype.unitary = function(p) {
    var m = this.module(p);
    return new Vec3(p.x / m, p.y / m, p.z / m, 0);
}

Vec3.prototype.show = function() {
    console.log("x: " + this.x + ", y: " + this.y + ", z: " + this.z);
}



function Camera(eye, at, up) {
    this.eye = eye;
    this.at = at;
    this.up = up;
}

function lookAtM(eye, at, up) {
    var F = identity();
    Vec = new Vec3();
    zc = Vec.unitary(Vec.minus(eye, at));
    xc = Vec.unitary(Vec.cross(up, zc));
    yc = Vec.unitary(Vec.cross(zc, xc));
    F[0][0] = xc.x;
    F[0][1] = yc.x;
    F[0][2] = zc.x;

    F[1][0] = xc.y;
    F[1][1] = yc.y;
    F[1][2] = zc.y;

    F[2][0] = xc.z;
    F[2][1] = yc.z;
    F[2][2] = zc.z;

    F[0][3] = eye.x;
    F[1][3] = eye.y;
    F[2][3] = eye.z;
    return F;
}

//TODO: faça função que mapeia de camera para mundo de câmera para mundo e retorne uma matriz 4x4
function lookAtInverseM(eye, at, up) {
    //
}

//de mundo para camera
Camera.prototype.lookAt = function() {
    return lookAtM(this.eye, this.at, this.up);
}

//de câmera para mundo
Camera.prototype.lookAtInverse = function() {
    return lookAtInverseM(this.eye, this.at, this.up);
}

//ids shape
var sphere = 1;
var plane = 2;
var triangle = 3;

function Shape(type_shape = sphere) {
    this.geometry = type_shape;
    this.name = "";
    this.translate = new Vec3(0, 0, 0);
    this.scale = new Vec3(0, 0, 0);
    this.rotate = new Vec3(0, 0, 0);
}

function Shape(name, type_shape = sphere) {
    this.geometry = type_shape;
    this.name = name;
    this.translate = new Vec3(0, 0, 0);
    this.scale = new Vec3(0, 0, 0);
    this.rotate = new Vec3(0, 0, 0);
    this.shine = 0.0;
}

Shape.prototype.setScale = function(x = 0, y = 0, z = 0) {
    this.scale = new Vec3(x, y, z);
}


Shape.prototype.setTranslate = function(x = 0, y = 0, z = 0) {
    this.translate = new Vec3(x, y, z);
}

Shape.prototype.setRotateX = function(angle) {
    this.rotate.x = angle;
}

Shape.prototype.setRotateY = function(angle) {
    this.rotate.y = angle;
}

Shape.prototype.setRotateZ = function(angle) {
    this.rotate.z = angle;
}

Shape.prototype.transformMatrix = function() {
    var T = translateMatrix(this.translate.x, this.translate.y, this.translate.z); //TODO: modificar para receber a matriz de escala
    var R = multMatrix(rotateMatrixX(this.rotate.x), multMatrix(rotateMatrixY(this.rotate.y), rotateMatrixZ(this.rotate.z))); //TODO: modificar para receber a matriz de rotação
    var S = scaleMatrix(this.scale.x, this.scale.y, this.scale.z);
    return multMatrix(T, multMatrix(R, S));
}

Shape.prototype.transformMatrixInverse = function() {
    var Ti = translateMatrixI(this.translate.x, this.translate.y, this.translate.z);
    var Ri = multMatrix(rotateMatrixZI(this.rotate.z), multMatrix(rotateMatrixYI(this.rotate.y), rotateMatrixXI(this.rotate.x)));
    var Si = scaleMatrixI(this.scale.x, this.scale.y, this.scale.z);
    return multMatrix(Si, multMatrix(Ri, Ti));
}



Shape.prototype.testPlaneIntersection = function(ray) {
    var Vec = new Vec3();
    var n_plane = new Vec3(0, 1, 0);
    var q_plane = new Vec3(0, 0, 0);
    var denominador = Vec.dot(n_plane, ray.d);
    if (denominador != 0) {
        t = Vec.dot(n_plane, Vec.minus(q_plane, ray.o)) / denominador;
        var point = ray.get(t);
        if ((point.x >= -0.5) && (point.x <= 0.5) && (point.z >= -0.5) && (point.z <= 0.5)) {
            return t;
        }
    }
    return undefined;
}




Shape.prototype.testTriangleIntersection = function(ray) {
    //transformando de coordenadas de mundo paa coordenadas de objeto
    var Vec = new Vec3();
    var M_i = this.transformMatrixInverse();
    ray.o = multVec4(M_i, ray.o);
    ray.d = multVec4(M_i, ray.d);
    var n_plane = new Vec3(0, 1, 0);
    var q_plane = new Vec3(0, 0, 0);
    var denominador = Vec.dot(n_plane, ray.d);
    if (denominador != 0) {
        t = Vec.dot(n_plane, Vec.minus(q_plane, ray.o)) / denominador;
        var point = ray.get(t);
        var a_point = new Vec3(0, 0, 0.5);
        var b_point = new Vec3(0.5, 0, -0.5);
        var c_point = new Vec3(-0.5, 0, -0.5);
        if (
            Vec.dot((Vec.cross(Vec.minus(b_point, a_point), Vec.minus(point, a_point))), n_plane) >= 0 &&
            Vec.dot((Vec.cross(Vec.minus(c_point, b_point), Vec.minus(point, b_point))), n_plane) >= 0 &&
            Vec.dot((Vec.cross(Vec.minus(a_point, c_point), Vec.minus(point, c_point))), n_plane) >= 0
        ) {
            return t;
        }
    }
    return undefined;
}

Shape.prototype.testTriangleTestIntersection = function(ray) {
    //transformando de coordenadas de mundo paa coordenadas de objeto
    var Vec = new Vec3();
    var M_i = this.transformMatrixInverse();
    ray.o = multVec4(M_i, ray.o);
    ray.d = multVec4(M_i, ray.d);

    console.log('origin', ray.o)
    console.log('direction', ray.d)

    var n_plane = new Vec3(0, 1, 0);
    var q_plane = new Vec3(0, 0, 0);
    var denominador = Vec.dot(n_plane, ray.d);
    if (denominador != 0) {
        t = Vec.dot(n_plane, Vec.minus(q_plane, ray.o)) / denominador;
        var point = ray.get(t);
        console.log('t', t)
        console.log(point)
        var a_point = new Vec3(0, 0, 0.5);
        var b_point = new Vec3(0.5, 0, -0.5);
        var c_point = new Vec3(-0.5, 0, -0.5);
        if (
            Vec.dot((Vec.cross(Vec.minus(b_point, a_point), Vec.minus(point, a_point))), n_plane) >= 0 &&
            Vec.dot((Vec.cross(Vec.minus(c_point, b_point), Vec.minus(point, b_point))), n_plane) >= 0 &&
            Vec.dot((Vec.cross(Vec.minus(a_point, c_point), Vec.minus(point, c_point))), n_plane) >= 0
        ) {
            return t;
        }
    }
    return undefined;
}

Shape.prototype.getDataIntersection = function(ray_w, normal, point) {
    var Vec = new Vec3();
    var M = this.transformMatrix();
    point = multVec4(M, point);
    normal.w = 0; //considerar como sendo um vetor
    normal = multVec4(M, normal);
    var t_ = Vec.module(Vec.minus(point, ray_w.o));
    return [true, point, normal, t_];
}

Shape.prototype.testIntersectionRay = function(ray) {
    //salvando raio em coordenadas do mundo para calcular o parâmetro t
    var ray_w = new Ray(ray.o, ray.d);
    var M_i = this.transformMatrixInverse();
    var Vec = new Vec3();
    //transformando raio para coordenadas locais do objeto

    ray.o = multVec4(M_i, ray.o);
    ray.d = multVec4(M_i, ray.d);

    if (this.geometry == sphere) { //testar interseção com a esfera
        //interseção com esfera na origem e raio unitário
        var a = Vec.dot(ray.d, ray.d);
        var b = 2 * (Vec.dot(ray.d, ray.o));
        var c = Vec.dot(ray.o, ray.o) - 1;
        var delta = b * b - 4 * a * c;
        if (delta >= 0) {
            var t1 = (-b + Math.sqrt(delta)) / (2 * a);
            var t2 = (-b - Math.sqrt(delta)) / (2 * a);

            t = Math.min(t1, t2);
            var point = ray.get(t);
            var normal = point;
            return this.getDataIntersection(ray_w, normal, point)
        }

    } else if (this.geometry == plane) {
        t = this.testPlaneIntersection(ray)
        if (t !== undefined) {
            var point = ray.get(t);
            var normal = new Vec3(0, 1, 0);
            return this.getDataIntersection(ray_w, normal, point)
        }

    } else if (this.geometry == triangle) {
        t = this.testTriangleIntersection(ray)
        if (t !== undefined) {
            var point = ray.get(t);
            var normal = new Vec3(0, 1, 0);
            return this.getDataIntersection(ray_w, normal, point)
        }

    }
    return [false, null];
}


function exercise_22() {
    var Vec = new Vec3();
    var shape = new Shape("triangle", 3);
    shape.setTranslate(0, 2, -2);
    shape.setScale(3, 2, 3);
    shape.setRotateX(90);

    var ray = new Ray(new Vec3(5, 5, 5), Vec.minus(new Vec3(0, 2, 1), new Vec3(5, 5, 5)));

    result = shape.testTriangleTestIntersection(ray);
    console.log(result)
}
/*
vec3 N = normalize(fragNormal);
vec3 L = normalize(lightPos - vertPos);

// Lambert's cosine law
float lambertian = max(dot(N, L), 0.0);
float specular = 0.0;
if(lambertian > 0.0) {
  vec3 R = reflect(-L, N);      // Reflected light vector
  vec3 V = normalize(viewer-vertPos); // Vector to viewer
  // Compute the specular term
 
 float specAngle = max(dot(R, V), 0.0);
 specular = pow(specAngle, shininessVal);	  
  
  
}
gl_FragColor = vec4(Ka * ambientColor +
					Kd * lambertian * diffuseColor +
					Ks * specular * specularColor, 1.0);

*/

function phongColor(_position_obj, _normal_obj, _position_viewer, light = undefined, object = undefined) {
    /*parameters light*/
    light_position = new Vec3(0, 5, 0);
    light_amb = new Vec3(.1, .1, .1);
    light_dif = new Vec3(.8, .8, .8);
    light_spe = new Vec3(0, 0, 0);

    /*paramenters object */
    object_amb = new Vec3(.1, .1, .1);
    object_dif = new Vec3(1, .1, 0);
    object_spe = new Vec3(0, 0, 0);

    vec = new Vec3()
    N = vec.unitary(_normal_obj);
    L = vec.unitary((vec.minus(light_position, _position_obj)));
    var lambertian = Math.max(vec.dot(N, L), 0.0);
    //TODO: obter componente especular
    var specular = 0
    let color_ambient = vec.compond(light_amb, object_amb)
    let color_diffuse = vec.prod(vec.compond(light_dif, object_dif), lambertian)
    let color_specular = vec.prod(vec.compond(light_spe, object_spe), specular)
    return vec.sum(vec.sum(color_ambient, color_diffuse), color_specular)

}
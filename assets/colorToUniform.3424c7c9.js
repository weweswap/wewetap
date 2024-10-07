import { am as getTestContext, an as uid, M as EventEmitter, W as BindGroup, ao as TextureSource, X as Texture, ak as nextPow2, N as warn } from './index.9a5db10d.js';

const idCounts = /* @__PURE__ */ Object.create(null);
const idHash = /* @__PURE__ */ Object.create(null);
function createIdFromString(value, groupId) {
  let id = idHash[value];
  if (id === void 0) {
    if (idCounts[groupId] === void 0) {
      idCounts[groupId] = 1;
    }
    idHash[value] = id = idCounts[groupId]++;
  }
  return id;
}

let maxFragmentPrecision;
function getMaxFragmentPrecision() {
  if (!maxFragmentPrecision) {
    maxFragmentPrecision = "mediump";
    const gl = getTestContext();
    if (gl) {
      if (gl.getShaderPrecisionFormat) {
        const shaderFragment = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
        maxFragmentPrecision = shaderFragment.precision ? "highp" : "mediump";
      }
    }
  }
  return maxFragmentPrecision;
}

function addProgramDefines(src, isES300, isFragment) {
  if (isES300)
    return src;
  if (isFragment) {
    src = src.replace("out vec4 finalColor;", "");
    return `
        
        #ifdef GL_ES // This checks if it is WebGL1
        #define in varying
        #define finalColor gl_FragColor
        #define texture texture2D
        #endif
        ${src}
        `;
  }
  return `
        
        #ifdef GL_ES // This checks if it is WebGL1
        #define in attribute
        #define out varying
        #endif
        ${src}
        `;
}

function ensurePrecision(src, options, isFragment) {
  const maxSupportedPrecision = isFragment ? options.maxSupportedFragmentPrecision : options.maxSupportedVertexPrecision;
  if (src.substring(0, 9) !== "precision") {
    let precision = isFragment ? options.requestedFragmentPrecision : options.requestedVertexPrecision;
    if (precision === "highp" && maxSupportedPrecision !== "highp") {
      precision = "mediump";
    }
    return `precision ${precision} float;
${src}`;
  } else if (maxSupportedPrecision !== "highp" && src.substring(0, 15) === "precision highp") {
    return src.replace("precision highp", "precision mediump");
  }
  return src;
}

function insertVersion(src, isES300) {
  if (!isES300)
    return src;
  return `#version 300 es
${src}`;
}

const fragmentNameCache = {};
const VertexNameCache = {};
function setProgramName(src, { name = `pixi-program` }, isFragment = true) {
  name = name.replace(/\s+/g, "-");
  name += isFragment ? "-fragment" : "-vertex";
  const nameCache = isFragment ? fragmentNameCache : VertexNameCache;
  if (nameCache[name]) {
    nameCache[name]++;
    name += `-${nameCache[name]}`;
  } else {
    nameCache[name] = 1;
  }
  if (src.indexOf("#define SHADER_NAME") !== -1)
    return src;
  const shaderName = `#define SHADER_NAME ${name}`;
  return `${shaderName}
${src}`;
}

function stripVersion(src, isES300) {
  if (!isES300)
    return src;
  return src.replace("#version 300 es", "");
}

const processes = {
  // strips any version headers..
  stripVersion,
  // adds precision string if not already present
  ensurePrecision,
  // add some defines if WebGL1 to make it more compatible with WebGL2 shaders
  addProgramDefines,
  // add the program name to the shader
  setProgramName,
  // add the version string to the shader header
  insertVersion
};
const programCache$1 = /* @__PURE__ */ Object.create(null);
const _GlProgram = class _GlProgram {
  /**
   * Creates a shiny new GlProgram. Used by WebGL renderer.
   * @param options - The options for the program.
   */
  constructor(options) {
    options = { ..._GlProgram.defaultOptions, ...options };
    const isES300 = options.fragment.indexOf("#version 300 es") !== -1;
    const preprocessorOptions = {
      stripVersion: isES300,
      ensurePrecision: {
        requestedFragmentPrecision: options.preferredFragmentPrecision,
        requestedVertexPrecision: options.preferredVertexPrecision,
        maxSupportedVertexPrecision: "highp",
        maxSupportedFragmentPrecision: getMaxFragmentPrecision()
      },
      setProgramName: {
        name: options.name
      },
      addProgramDefines: isES300,
      insertVersion: isES300
    };
    let fragment = options.fragment;
    let vertex = options.vertex;
    Object.keys(processes).forEach((processKey) => {
      const processOptions = preprocessorOptions[processKey];
      fragment = processes[processKey](fragment, processOptions, true);
      vertex = processes[processKey](vertex, processOptions, false);
    });
    this.fragment = fragment;
    this.vertex = vertex;
    this._key = createIdFromString(`${this.vertex}:${this.fragment}`, "gl-program");
  }
  /** destroys the program */
  destroy() {
    this.fragment = null;
    this.vertex = null;
    this._attributeData = null;
    this._uniformData = null;
    this._uniformBlockData = null;
    this.transformFeedbackVaryings = null;
  }
  /**
   * Helper function that creates a program for a given source.
   * It will check the program cache if the program has already been created.
   * If it has that one will be returned, if not a new one will be created and cached.
   * @param options - The options for the program.
   * @returns A program using the same source
   */
  static from(options) {
    const key = `${options.vertex}:${options.fragment}`;
    if (!programCache$1[key]) {
      programCache$1[key] = new _GlProgram(options);
    }
    return programCache$1[key];
  }
};
/** The default options used by the program. */
_GlProgram.defaultOptions = {
  preferredVertexPrecision: "highp",
  preferredFragmentPrecision: "mediump"
};
let GlProgram = _GlProgram;

const attributeFormatData = {
  uint8x2: { size: 2, stride: 2, normalised: false },
  uint8x4: { size: 4, stride: 4, normalised: false },
  sint8x2: { size: 2, stride: 2, normalised: false },
  sint8x4: { size: 4, stride: 4, normalised: false },
  unorm8x2: { size: 2, stride: 2, normalised: true },
  unorm8x4: { size: 4, stride: 4, normalised: true },
  snorm8x2: { size: 2, stride: 2, normalised: true },
  snorm8x4: { size: 4, stride: 4, normalised: true },
  uint16x2: { size: 2, stride: 4, normalised: false },
  uint16x4: { size: 4, stride: 8, normalised: false },
  sint16x2: { size: 2, stride: 4, normalised: false },
  sint16x4: { size: 4, stride: 8, normalised: false },
  unorm16x2: { size: 2, stride: 4, normalised: true },
  unorm16x4: { size: 4, stride: 8, normalised: true },
  snorm16x2: { size: 2, stride: 4, normalised: true },
  snorm16x4: { size: 4, stride: 8, normalised: true },
  float16x2: { size: 2, stride: 4, normalised: false },
  float16x4: { size: 4, stride: 8, normalised: false },
  float32: { size: 1, stride: 4, normalised: false },
  float32x2: { size: 2, stride: 8, normalised: false },
  float32x3: { size: 3, stride: 12, normalised: false },
  float32x4: { size: 4, stride: 16, normalised: false },
  uint32: { size: 1, stride: 4, normalised: false },
  uint32x2: { size: 2, stride: 8, normalised: false },
  uint32x3: { size: 3, stride: 12, normalised: false },
  uint32x4: { size: 4, stride: 16, normalised: false },
  sint32: { size: 1, stride: 4, normalised: false },
  sint32x2: { size: 2, stride: 8, normalised: false },
  sint32x3: { size: 3, stride: 12, normalised: false },
  sint32x4: { size: 4, stride: 16, normalised: false }
};
function getAttributeInfoFromFormat(format) {
  return attributeFormatData[format] ?? attributeFormatData.float32;
}

const WGSL_TO_VERTEX_TYPES = {
  f32: "float32",
  "vec2<f32>": "float32x2",
  "vec3<f32>": "float32x3",
  "vec4<f32>": "float32x4",
  vec2f: "float32x2",
  vec3f: "float32x3",
  vec4f: "float32x4",
  i32: "sint32",
  "vec2<i32>": "sint32x2",
  "vec3<i32>": "sint32x3",
  "vec4<i32>": "sint32x4",
  u32: "uint32",
  "vec2<u32>": "uint32x2",
  "vec3<u32>": "uint32x3",
  "vec4<u32>": "uint32x4",
  bool: "uint32",
  "vec2<bool>": "uint32x2",
  "vec3<bool>": "uint32x3",
  "vec4<bool>": "uint32x4"
};
function extractAttributesFromGpuProgram({ source, entryPoint }) {
  const results = {};
  const mainVertStart = source.indexOf(`fn ${entryPoint}`);
  if (mainVertStart !== -1) {
    const arrowFunctionStart = source.indexOf("->", mainVertStart);
    if (arrowFunctionStart !== -1) {
      const functionArgsSubstring = source.substring(mainVertStart, arrowFunctionStart);
      const inputsRegex = /@location\((\d+)\)\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_<>]+)(?:,|\s|$)/g;
      let match;
      while ((match = inputsRegex.exec(functionArgsSubstring)) !== null) {
        const format = WGSL_TO_VERTEX_TYPES[match[3]] ?? "float32";
        results[match[2]] = {
          location: parseInt(match[1], 10),
          format,
          stride: getAttributeInfoFromFormat(format).stride,
          offset: 0,
          instance: false,
          start: 0
        };
      }
    }
  }
  return results;
}

function extractStructAndGroups(wgsl) {
  const linePattern = /(^|[^/])@(group|binding)\(\d+\)[^;]+;/g;
  const groupPattern = /@group\((\d+)\)/;
  const bindingPattern = /@binding\((\d+)\)/;
  const namePattern = /var(<[^>]+>)? (\w+)/;
  const typePattern = /:\s*(\w+)/;
  const structPattern = /struct\s+(\w+)\s*{([^}]+)}/g;
  const structMemberPattern = /(\w+)\s*:\s*([\w\<\>]+)/g;
  const structName = /struct\s+(\w+)/;
  const groups = wgsl.match(linePattern)?.map((item) => ({
    group: parseInt(item.match(groupPattern)[1], 10),
    binding: parseInt(item.match(bindingPattern)[1], 10),
    name: item.match(namePattern)[2],
    isUniform: item.match(namePattern)[1] === "<uniform>",
    type: item.match(typePattern)[1]
  }));
  if (!groups) {
    return {
      groups: [],
      structs: []
    };
  }
  const structs = wgsl.match(structPattern)?.map((struct) => {
    const name = struct.match(structName)[1];
    const members = struct.match(structMemberPattern).reduce((acc, member) => {
      const [name2, type] = member.split(":");
      acc[name2.trim()] = type.trim();
      return acc;
    }, {});
    if (!members) {
      return null;
    }
    return { name, members };
  }).filter(({ name }) => groups.some((group) => group.type === name)) ?? [];
  return {
    groups,
    structs
  };
}

var ShaderStage = /* @__PURE__ */ ((ShaderStage2) => {
  ShaderStage2[ShaderStage2["VERTEX"] = 1] = "VERTEX";
  ShaderStage2[ShaderStage2["FRAGMENT"] = 2] = "FRAGMENT";
  ShaderStage2[ShaderStage2["COMPUTE"] = 4] = "COMPUTE";
  return ShaderStage2;
})(ShaderStage || {});

function generateGpuLayoutGroups({ groups }) {
  const layout = [];
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    if (!layout[group.group]) {
      layout[group.group] = [];
    }
    if (group.isUniform) {
      layout[group.group].push({
        binding: group.binding,
        visibility: ShaderStage.VERTEX | ShaderStage.FRAGMENT,
        buffer: {
          type: "uniform"
        }
      });
    } else if (group.type === "sampler") {
      layout[group.group].push({
        binding: group.binding,
        visibility: ShaderStage.FRAGMENT,
        sampler: {
          type: "filtering"
        }
      });
    } else if (group.type === "texture_2d") {
      layout[group.group].push({
        binding: group.binding,
        visibility: ShaderStage.FRAGMENT,
        texture: {
          sampleType: "float",
          viewDimension: "2d",
          multisampled: false
        }
      });
    }
  }
  return layout;
}

function generateLayoutHash({ groups }) {
  const layout = [];
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    if (!layout[group.group]) {
      layout[group.group] = {};
    }
    layout[group.group][group.name] = group.binding;
  }
  return layout;
}

function removeStructAndGroupDuplicates(vertexStructsAndGroups, fragmentStructsAndGroups) {
  const structNameSet = /* @__PURE__ */ new Set();
  const dupeGroupKeySet = /* @__PURE__ */ new Set();
  const structs = [...vertexStructsAndGroups.structs, ...fragmentStructsAndGroups.structs].filter((struct) => {
    if (structNameSet.has(struct.name)) {
      return false;
    }
    structNameSet.add(struct.name);
    return true;
  });
  const groups = [...vertexStructsAndGroups.groups, ...fragmentStructsAndGroups.groups].filter((group) => {
    const key = `${group.name}-${group.binding}`;
    if (dupeGroupKeySet.has(key)) {
      return false;
    }
    dupeGroupKeySet.add(key);
    return true;
  });
  return { structs, groups };
}

const programCache = /* @__PURE__ */ Object.create(null);
class GpuProgram {
  /**
   * Create a new GpuProgram
   * @param options - The options for the gpu program
   */
  constructor(options) {
    /**
     * @internal
     * @ignore
     */
    this._layoutKey = 0;
    const { fragment, vertex, layout, gpuLayout, name } = options;
    this.name = name;
    this.fragment = fragment;
    this.vertex = vertex;
    if (fragment.source === vertex.source) {
      const structsAndGroups = extractStructAndGroups(fragment.source);
      this.structsAndGroups = structsAndGroups;
    } else {
      const vertexStructsAndGroups = extractStructAndGroups(vertex.source);
      const fragmentStructsAndGroups = extractStructAndGroups(fragment.source);
      this.structsAndGroups = removeStructAndGroupDuplicates(vertexStructsAndGroups, fragmentStructsAndGroups);
    }
    this.layout = layout ?? generateLayoutHash(this.structsAndGroups);
    this.gpuLayout = gpuLayout ?? generateGpuLayoutGroups(this.structsAndGroups);
    this.autoAssignGlobalUniforms = !!(this.layout[0]?.globalUniforms !== void 0);
    this.autoAssignLocalUniforms = !!(this.layout[1]?.localUniforms !== void 0);
    this._generateProgramKey();
  }
  // TODO maker this pure
  _generateProgramKey() {
    const { vertex, fragment } = this;
    const bigKey = vertex.source + fragment.source + vertex.entryPoint + fragment.entryPoint;
    this._layoutKey = createIdFromString(bigKey, "program");
  }
  get attributeData() {
    this._attributeData ?? (this._attributeData = extractAttributesFromGpuProgram(this.vertex));
    return this._attributeData;
  }
  /** destroys the program */
  destroy() {
    this.gpuLayout = null;
    this.layout = null;
    this.structsAndGroups = null;
    this.fragment = null;
    this.vertex = null;
  }
  /**
   * Helper function that creates a program for a given source.
   * It will check the program cache if the program has already been created.
   * If it has that one will be returned, if not a new one will be created and cached.
   * @param options - The options for the program.
   * @returns A program using the same source
   */
  static from(options) {
    const key = `${options.vertex.source}:${options.fragment.source}:${options.fragment.entryPoint}:${options.vertex.entryPoint}`;
    if (!programCache[key]) {
      programCache[key] = new GpuProgram(options);
    }
    return programCache[key];
  }
}

const UNIFORM_TYPES_VALUES = [
  "f32",
  "i32",
  "vec2<f32>",
  "vec3<f32>",
  "vec4<f32>",
  "mat2x2<f32>",
  "mat3x3<f32>",
  "mat4x4<f32>",
  "mat3x2<f32>",
  "mat4x2<f32>",
  "mat2x3<f32>",
  "mat4x3<f32>",
  "mat2x4<f32>",
  "mat3x4<f32>"
];
const UNIFORM_TYPES_MAP = UNIFORM_TYPES_VALUES.reduce((acc, type) => {
  acc[type] = true;
  return acc;
}, {});

function getDefaultUniformValue(type, size) {
  switch (type) {
    case "f32":
      return 0;
    case "vec2<f32>":
      return new Float32Array(2 * size);
    case "vec3<f32>":
      return new Float32Array(3 * size);
    case "vec4<f32>":
      return new Float32Array(4 * size);
    case "mat2x2<f32>":
      return new Float32Array([
        1,
        0,
        0,
        1
      ]);
    case "mat3x3<f32>":
      return new Float32Array([
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1
      ]);
    case "mat4x4<f32>":
      return new Float32Array([
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      ]);
  }
  return null;
}

const _UniformGroup = class _UniformGroup {
  /**
   * Create a new Uniform group
   * @param uniformStructures - The structures of the uniform group
   * @param options - The optional parameters of this uniform group
   */
  constructor(uniformStructures, options) {
    /** used internally to know if a uniform group was used in the last render pass */
    this._touched = 0;
    /** a unique id for this uniform group used through the renderer */
    this.uid = uid("uniform");
    /** a resource type, used to identify how to handle it when its in a bind group / shader resource */
    this._resourceType = "uniformGroup";
    /** the resource id used internally by the renderer to build bind group keys */
    this._resourceId = uid("resource");
    /** used ito identify if this is a uniform group */
    this.isUniformGroup = true;
    /**
     * used to flag if this Uniform groups data is different from what it has stored in its buffer / on the GPU
     * @internal
     * @ignore
     */
    this._dirtyId = 0;
    // implementing the interface - UniformGroup are not destroyed
    this.destroyed = false;
    options = { ..._UniformGroup.defaultOptions, ...options };
    this.uniformStructures = uniformStructures;
    const uniforms = {};
    for (const i in uniformStructures) {
      const uniformData = uniformStructures[i];
      uniformData.name = i;
      uniformData.size = uniformData.size ?? 1;
      if (!UNIFORM_TYPES_MAP[uniformData.type]) {
        throw new Error(`Uniform type ${uniformData.type} is not supported. Supported uniform types are: ${UNIFORM_TYPES_VALUES.join(", ")}`);
      }
      uniformData.value ?? (uniformData.value = getDefaultUniformValue(uniformData.type, uniformData.size));
      uniforms[i] = uniformData.value;
    }
    this.uniforms = uniforms;
    this._dirtyId = 1;
    this.ubo = options.ubo;
    this.isStatic = options.isStatic;
    this._signature = createIdFromString(Object.keys(uniforms).map(
      (i) => `${i}-${uniformStructures[i].type}`
    ).join("-"), "uniform-group");
  }
  /** Call this if you want the uniform groups data to be uploaded to the GPU only useful if `isStatic` is true. */
  update() {
    this._dirtyId++;
  }
};
/** The default options used by the uniform group. */
_UniformGroup.defaultOptions = {
  /** if true the UniformGroup is handled as an Uniform buffer object. */
  ubo: false,
  /** if true, then you are responsible for when the data is uploaded to the GPU by calling `update()` */
  isStatic: false
};
let UniformGroup = _UniformGroup;

var RendererType = /* @__PURE__ */ ((RendererType2) => {
  RendererType2[RendererType2["WEBGL"] = 1] = "WEBGL";
  RendererType2[RendererType2["WEBGPU"] = 2] = "WEBGPU";
  RendererType2[RendererType2["BOTH"] = 3] = "BOTH";
  return RendererType2;
})(RendererType || {});

class Shader extends EventEmitter {
  constructor(options) {
    super();
    /**
     * A record of the uniform groups and resources used by the shader.
     * This is used by WebGL renderer to sync uniform data.
     * @internal
     * @ignore
     */
    this._uniformBindMap = /* @__PURE__ */ Object.create(null);
    this._ownedBindGroups = [];
    let {
      gpuProgram,
      glProgram,
      groups,
      resources,
      compatibleRenderers,
      groupMap
    } = options;
    this.gpuProgram = gpuProgram;
    this.glProgram = glProgram;
    if (compatibleRenderers === void 0) {
      compatibleRenderers = 0;
      if (gpuProgram)
        compatibleRenderers |= RendererType.WEBGPU;
      if (glProgram)
        compatibleRenderers |= RendererType.WEBGL;
    }
    this.compatibleRenderers = compatibleRenderers;
    const nameHash = {};
    if (!resources && !groups) {
      resources = {};
    }
    if (resources && groups) {
      throw new Error("[Shader] Cannot have both resources and groups");
    } else if (!gpuProgram && groups && !groupMap) {
      throw new Error("[Shader] No group map or WebGPU shader provided - consider using resources instead.");
    } else if (!gpuProgram && groups && groupMap) {
      for (const i in groupMap) {
        for (const j in groupMap[i]) {
          const uniformName = groupMap[i][j];
          nameHash[uniformName] = {
            group: i,
            binding: j,
            name: uniformName
          };
        }
      }
    } else if (gpuProgram && groups && !groupMap) {
      const groupData = gpuProgram.structsAndGroups.groups;
      groupMap = {};
      groupData.forEach((data) => {
        groupMap[data.group] = groupMap[data.group] || {};
        groupMap[data.group][data.binding] = data.name;
        nameHash[data.name] = data;
      });
    } else if (resources) {
      groups = {};
      groupMap = {};
      if (gpuProgram) {
        const groupData = gpuProgram.structsAndGroups.groups;
        groupData.forEach((data) => {
          groupMap[data.group] = groupMap[data.group] || {};
          groupMap[data.group][data.binding] = data.name;
          nameHash[data.name] = data;
        });
      }
      let bindTick = 0;
      for (const i in resources) {
        if (nameHash[i])
          continue;
        if (!groups[99]) {
          groups[99] = new BindGroup();
          this._ownedBindGroups.push(groups[99]);
        }
        nameHash[i] = { group: 99, binding: bindTick, name: i };
        groupMap[99] = groupMap[99] || {};
        groupMap[99][bindTick] = i;
        bindTick++;
      }
      for (const i in resources) {
        const name = i;
        let value = resources[i];
        if (!value.source && !value._resourceType) {
          value = new UniformGroup(value);
        }
        const data = nameHash[name];
        if (data) {
          if (!groups[data.group]) {
            groups[data.group] = new BindGroup();
            this._ownedBindGroups.push(groups[data.group]);
          }
          groups[data.group].setResource(value, data.binding);
        }
      }
    }
    this.groups = groups;
    this._uniformBindMap = groupMap;
    this.resources = this._buildResourceAccessor(groups, nameHash);
  }
  /**
   * Sometimes a resource group will be provided later (for example global uniforms)
   * In such cases, this method can be used to let the shader know about the group.
   * @param name - the name of the resource group
   * @param groupIndex - the index of the group (should match the webGPU shader group location)
   * @param bindIndex - the index of the bind point (should match the webGPU shader bind point)
   */
  addResource(name, groupIndex, bindIndex) {
    var _a, _b;
    (_a = this._uniformBindMap)[groupIndex] || (_a[groupIndex] = {});
    (_b = this._uniformBindMap[groupIndex])[bindIndex] || (_b[bindIndex] = name);
    if (!this.groups[groupIndex]) {
      this.groups[groupIndex] = new BindGroup();
      this._ownedBindGroups.push(this.groups[groupIndex]);
    }
  }
  _buildResourceAccessor(groups, nameHash) {
    const uniformsOut = {};
    for (const i in nameHash) {
      const data = nameHash[i];
      Object.defineProperty(uniformsOut, data.name, {
        get() {
          return groups[data.group].getResource(data.binding);
        },
        set(value) {
          groups[data.group].setResource(value, data.binding);
        }
      });
    }
    return uniformsOut;
  }
  /**
   * Use to destroy the shader when its not longer needed.
   * It will destroy the resources and remove listeners.
   * @param destroyPrograms - if the programs should be destroyed as well.
   * Make sure its not being used by other shaders!
   */
  destroy(destroyPrograms = false) {
    this.emit("destroy", this);
    if (destroyPrograms) {
      this.gpuProgram?.destroy();
      this.glProgram?.destroy();
    }
    this.gpuProgram = null;
    this.glProgram = null;
    this.removeAllListeners();
    this._uniformBindMap = null;
    this._ownedBindGroups.forEach((bindGroup) => {
      bindGroup.destroy();
    });
    this._ownedBindGroups = null;
    this.resources = null;
    this.groups = null;
  }
  static from(options) {
    const { gpu, gl, ...rest } = options;
    let gpuProgram;
    let glProgram;
    if (gpu) {
      gpuProgram = GpuProgram.from(gpu);
    }
    if (gl) {
      glProgram = GlProgram.from(gl);
    }
    return new Shader({
      gpuProgram,
      glProgram,
      ...rest
    });
  }
}

let count = 0;
class TexturePoolClass {
  /**
   * @param textureOptions - options that will be passed to BaseRenderTexture constructor
   * @param {SCALE_MODE} [textureOptions.scaleMode] - See {@link SCALE_MODE} for possible values.
   */
  constructor(textureOptions) {
    this._poolKeyHash = /* @__PURE__ */ Object.create(null);
    this._texturePool = {};
    this.textureOptions = textureOptions || {};
    this.enableFullScreen = false;
  }
  /**
   * Creates texture with params that were specified in pool constructor.
   * @param pixelWidth - Width of texture in pixels.
   * @param pixelHeight - Height of texture in pixels.
   * @param antialias
   */
  createTexture(pixelWidth, pixelHeight, antialias) {
    const textureSource = new TextureSource({
      ...this.textureOptions,
      width: pixelWidth,
      height: pixelHeight,
      resolution: 1,
      antialias,
      autoGarbageCollect: true
    });
    return new Texture({
      source: textureSource,
      label: `texturePool_${count++}`
    });
  }
  /**
   * Gets a Power-of-Two render texture or fullScreen texture
   * @param frameWidth - The minimum width of the render texture.
   * @param frameHeight - The minimum height of the render texture.
   * @param resolution - The resolution of the render texture.
   * @param antialias
   * @returns The new render texture.
   */
  getOptimalTexture(frameWidth, frameHeight, resolution = 1, antialias) {
    let po2Width = Math.ceil(frameWidth * resolution - 1e-6);
    let po2Height = Math.ceil(frameHeight * resolution - 1e-6);
    po2Width = nextPow2(po2Width);
    po2Height = nextPow2(po2Height);
    const key = (po2Width << 17) + (po2Height << 1) + (antialias ? 1 : 0);
    if (!this._texturePool[key]) {
      this._texturePool[key] = [];
    }
    let texture = this._texturePool[key].pop();
    if (!texture) {
      texture = this.createTexture(po2Width, po2Height, antialias);
    }
    texture.source._resolution = resolution;
    texture.source.width = po2Width / resolution;
    texture.source.height = po2Height / resolution;
    texture.source.pixelWidth = po2Width;
    texture.source.pixelHeight = po2Height;
    texture.frame.x = 0;
    texture.frame.y = 0;
    texture.frame.width = frameWidth;
    texture.frame.height = frameHeight;
    texture.updateUvs();
    this._poolKeyHash[texture.uid] = key;
    return texture;
  }
  /**
   * Gets extra texture of the same size as input renderTexture
   * @param texture - The texture to check what size it is.
   * @param antialias - Whether to use antialias.
   * @returns A texture that is a power of two
   */
  getSameSizeTexture(texture, antialias = false) {
    const source = texture.source;
    return this.getOptimalTexture(texture.width, texture.height, source._resolution, antialias);
  }
  /**
   * Place a render texture back into the pool.
   * @param renderTexture - The renderTexture to free
   */
  returnTexture(renderTexture) {
    const key = this._poolKeyHash[renderTexture.uid];
    this._texturePool[key].push(renderTexture);
  }
  /**
   * Clears the pool.
   * @param destroyTextures - Destroy all stored textures.
   */
  clear(destroyTextures) {
    destroyTextures = destroyTextures !== false;
    if (destroyTextures) {
      for (const i in this._texturePool) {
        const textures = this._texturePool[i];
        if (textures) {
          for (let j = 0; j < textures.length; j++) {
            textures[j].destroy(true);
          }
        }
      }
    }
    this._texturePool = {};
  }
}
const TexturePool = new TexturePoolClass();

function addBits(srcParts, parts, name) {
  if (srcParts) {
    for (const i in srcParts) {
      const id = i.toLocaleLowerCase();
      const part = parts[id];
      if (part) {
        let sanitisedPart = srcParts[i];
        if (i === "header") {
          sanitisedPart = sanitisedPart.replace(/@in\s+[^;]+;\s*/g, "").replace(/@out\s+[^;]+;\s*/g, "");
        }
        if (name) {
          part.push(`//----${name}----//`);
        }
        part.push(sanitisedPart);
      } else {
        warn(`${i} placement hook does not exist in shader`);
      }
    }
  }
}

const findHooksRx = /\{\{(.*?)\}\}/g;
function compileHooks(programSrc) {
  const parts = {};
  const partMatches = programSrc.match(findHooksRx)?.map((hook) => hook.replace(/[{()}]/g, "")) ?? [];
  partMatches.forEach((hook) => {
    parts[hook] = [];
  });
  return parts;
}

function extractInputs(fragmentSource, out) {
  let match;
  const regex = /@in\s+([^;]+);/g;
  while ((match = regex.exec(fragmentSource)) !== null) {
    out.push(match[1]);
  }
}
function compileInputs(fragments, template, sort = false) {
  const results = [];
  extractInputs(template, results);
  fragments.forEach((fragment) => {
    if (fragment.header) {
      extractInputs(fragment.header, results);
    }
  });
  const mainInput = results;
  if (sort) {
    mainInput.sort();
  }
  const finalString = mainInput.map((inValue, i) => `       @location(${i}) ${inValue},`).join("\n");
  let cleanedString = template.replace(/@in\s+[^;]+;\s*/g, "");
  cleanedString = cleanedString.replace("{{in}}", `
${finalString}
`);
  return cleanedString;
}

function extractOutputs(fragmentSource, out) {
  let match;
  const regex = /@out\s+([^;]+);/g;
  while ((match = regex.exec(fragmentSource)) !== null) {
    out.push(match[1]);
  }
}
function extractVariableName(value) {
  const regex = /\b(\w+)\s*:/g;
  const match = regex.exec(value);
  return match ? match[1] : "";
}
function stripVariable(value) {
  const regex = /@.*?\s+/g;
  return value.replace(regex, "");
}
function compileOutputs(fragments, template) {
  const results = [];
  extractOutputs(template, results);
  fragments.forEach((fragment) => {
    if (fragment.header) {
      extractOutputs(fragment.header, results);
    }
  });
  let index = 0;
  const mainStruct = results.sort().map((inValue) => {
    if (inValue.indexOf("builtin") > -1) {
      return inValue;
    }
    return `@location(${index++}) ${inValue}`;
  }).join(",\n");
  const mainStart = results.sort().map((inValue) => `       var ${stripVariable(inValue)};`).join("\n");
  const mainEnd = `return VSOutput(
                ${results.sort().map((inValue) => ` ${extractVariableName(inValue)}`).join(",\n")});`;
  let compiledCode = template.replace(/@out\s+[^;]+;\s*/g, "");
  compiledCode = compiledCode.replace("{{struct}}", `
${mainStruct}
`);
  compiledCode = compiledCode.replace("{{start}}", `
${mainStart}
`);
  compiledCode = compiledCode.replace("{{return}}", `
${mainEnd}
`);
  return compiledCode;
}

function injectBits(templateSrc, fragmentParts) {
  let out = templateSrc;
  for (const i in fragmentParts) {
    const parts = fragmentParts[i];
    const toInject = parts.join("\n");
    if (toInject.length) {
      out = out.replace(`{{${i}}}`, `//-----${i} START-----//
${parts.join("\n")}
//----${i} FINISH----//`);
    } else {
      out = out.replace(`{{${i}}}`, "");
    }
  }
  return out;
}

const cacheMap = /* @__PURE__ */ Object.create(null);
const bitCacheMap = /* @__PURE__ */ new Map();
let CACHE_UID = 0;
function compileHighShader({
  template,
  bits
}) {
  const cacheId = generateCacheId(template, bits);
  if (cacheMap[cacheId])
    return cacheMap[cacheId];
  const { vertex, fragment } = compileInputsAndOutputs(template, bits);
  cacheMap[cacheId] = compileBits(vertex, fragment, bits);
  return cacheMap[cacheId];
}
function compileHighShaderGl({
  template,
  bits
}) {
  const cacheId = generateCacheId(template, bits);
  if (cacheMap[cacheId])
    return cacheMap[cacheId];
  cacheMap[cacheId] = compileBits(template.vertex, template.fragment, bits);
  return cacheMap[cacheId];
}
function compileInputsAndOutputs(template, bits) {
  const vertexFragments = bits.map((shaderBit) => shaderBit.vertex).filter((v) => !!v);
  const fragmentFragments = bits.map((shaderBit) => shaderBit.fragment).filter((v) => !!v);
  let compiledVertex = compileInputs(vertexFragments, template.vertex, true);
  compiledVertex = compileOutputs(vertexFragments, compiledVertex);
  const compiledFragment = compileInputs(fragmentFragments, template.fragment, true);
  return {
    vertex: compiledVertex,
    fragment: compiledFragment
  };
}
function generateCacheId(template, bits) {
  return bits.map((highFragment) => {
    if (!bitCacheMap.has(highFragment)) {
      bitCacheMap.set(highFragment, CACHE_UID++);
    }
    return bitCacheMap.get(highFragment);
  }).sort((a, b) => a - b).join("-") + template.vertex + template.fragment;
}
function compileBits(vertex, fragment, bits) {
  const vertexParts = compileHooks(vertex);
  const fragmentParts = compileHooks(fragment);
  bits.forEach((shaderBit) => {
    addBits(shaderBit.vertex, vertexParts, shaderBit.name);
    addBits(shaderBit.fragment, fragmentParts, shaderBit.name);
  });
  return {
    vertex: injectBits(vertex, vertexParts),
    fragment: injectBits(fragment, fragmentParts)
  };
}

const vertexGPUTemplate = (
  /* wgsl */
  `
    @in aPosition: vec2<f32>;
    @in aUV: vec2<f32>;

    @out @builtin(position) vPosition: vec4<f32>;
    @out vUV : vec2<f32>;
    @out vColor : vec4<f32>;

    {{header}}

    struct VSOutput {
        {{struct}}
    };

    @vertex
    fn main( {{in}} ) -> VSOutput {

        var worldTransformMatrix = globalUniforms.uWorldTransformMatrix;
        var modelMatrix = mat3x3<f32>(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        var position = aPosition;
        var uv = aUV;

        {{start}}
        
        vColor = vec4<f32>(1., 1., 1., 1.);

        {{main}}

        vUV = uv;

        var modelViewProjectionMatrix = globalUniforms.uProjectionMatrix * worldTransformMatrix * modelMatrix;

        vPosition =  vec4<f32>((modelViewProjectionMatrix *  vec3<f32>(position, 1.0)).xy, 0.0, 1.0);
       
        vColor *= globalUniforms.uWorldColorAlpha;

        {{end}}

        {{return}}
    };
`
);
const fragmentGPUTemplate = (
  /* wgsl */
  `
    @in vUV : vec2<f32>;
    @in vColor : vec4<f32>;
   
    {{header}}

    @fragment
    fn main(
        {{in}}
      ) -> @location(0) vec4<f32> {
        
        {{start}}

        var outColor:vec4<f32>;
      
        {{main}}
        
        return outColor * vColor;
      };
`
);
const vertexGlTemplate = (
  /* glsl */
  `
    in vec2 aPosition;
    in vec2 aUV;

    out vec4 vColor;
    out vec2 vUV;

    {{header}}

    void main(void){

        mat3 worldTransformMatrix = uWorldTransformMatrix;
        mat3 modelMatrix = mat3(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        vec2 position = aPosition;
        vec2 uv = aUV;
        
        {{start}}
        
        vColor = vec4(1.);
        
        {{main}}
        
        vUV = uv;
        
        mat3 modelViewProjectionMatrix = uProjectionMatrix * worldTransformMatrix * modelMatrix;

        gl_Position = vec4((modelViewProjectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);

        vColor *= uWorldColorAlpha;

        {{end}}
    }
`
);
const fragmentGlTemplate = (
  /* glsl */
  `
   
    in vec4 vColor;
    in vec2 vUV;

    out vec4 finalColor;

    {{header}}

    void main(void) {
        
        {{start}}

        vec4 outColor;
      
        {{main}}
        
        finalColor = outColor * vColor;
    }
`
);

const globalUniformsBit = {
  name: "global-uniforms-bit",
  vertex: {
    header: (
      /* wgsl */
      `
        struct GlobalUniforms {
            uProjectionMatrix:mat3x3<f32>,
            uWorldTransformMatrix:mat3x3<f32>,
            uWorldColorAlpha: vec4<f32>,
            uResolution: vec2<f32>,
        }

        @group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
        `
    )
  }
};
const globalUniformsBitGl = {
  name: "global-uniforms-bit",
  vertex: {
    header: (
      /* glsl */
      `
          uniform mat3 uProjectionMatrix;
          uniform mat3 uWorldTransformMatrix;
          uniform vec4 uWorldColorAlpha;
          uniform vec2 uResolution;
        `
    )
  }
};

function compileHighShaderGpuProgram({ bits, name }) {
  const source = compileHighShader({
    template: {
      fragment: fragmentGPUTemplate,
      vertex: vertexGPUTemplate
    },
    bits: [
      globalUniformsBit,
      ...bits
    ]
  });
  return GpuProgram.from({
    name,
    vertex: {
      source: source.vertex,
      entryPoint: "main"
    },
    fragment: {
      source: source.fragment,
      entryPoint: "main"
    }
  });
}
function compileHighShaderGlProgram({ bits, name }) {
  return new GlProgram({
    name,
    ...compileHighShaderGl({
      template: {
        vertex: vertexGlTemplate,
        fragment: fragmentGlTemplate
      },
      bits: [
        globalUniformsBitGl,
        ...bits
      ]
    })
  });
}

const colorBit = {
  name: "color-bit",
  vertex: {
    header: (
      /* wgsl */
      `
            @in aColor: vec4<f32>;
        `
    ),
    main: (
      /* wgsl */
      `
            vColor *= vec4<f32>(aColor.rgb * aColor.a, aColor.a);
        `
    )
  }
};
const colorBitGl = {
  name: "color-bit",
  vertex: {
    header: (
      /* glsl */
      `
            in vec4 aColor;
        `
    ),
    main: (
      /* glsl */
      `
            vColor *= vec4(aColor.rgb * aColor.a, aColor.a);
        `
    )
  }
};

const textureBatchBitGpuCache = {};
function generateBindingSrc(maxTextures) {
  const src = [];
  if (maxTextures === 1) {
    src.push("@group(1) @binding(0) var textureSource1: texture_2d<f32>;");
    src.push("@group(1) @binding(1) var textureSampler1: sampler;");
  } else {
    let bindingIndex = 0;
    for (let i = 0; i < maxTextures; i++) {
      src.push(`@group(1) @binding(${bindingIndex++}) var textureSource${i + 1}: texture_2d<f32>;`);
      src.push(`@group(1) @binding(${bindingIndex++}) var textureSampler${i + 1}: sampler;`);
    }
  }
  return src.join("\n");
}
function generateSampleSrc(maxTextures) {
  const src = [];
  if (maxTextures === 1) {
    src.push("outColor = textureSampleGrad(textureSource1, textureSampler1, vUV, uvDx, uvDy);");
  } else {
    src.push("switch vTextureId {");
    for (let i = 0; i < maxTextures; i++) {
      if (i === maxTextures - 1) {
        src.push(`  default:{`);
      } else {
        src.push(`  case ${i}:{`);
      }
      src.push(`      outColor = textureSampleGrad(textureSource${i + 1}, textureSampler${i + 1}, vUV, uvDx, uvDy);`);
      src.push(`      break;}`);
    }
    src.push(`}`);
  }
  return src.join("\n");
}
function generateTextureBatchBit(maxTextures) {
  if (!textureBatchBitGpuCache[maxTextures]) {
    textureBatchBitGpuCache[maxTextures] = {
      name: "texture-batch-bit",
      vertex: {
        header: `
                @in aTextureIdAndRound: vec2<u32>;
                @out @interpolate(flat) vTextureId : u32;
            `,
        main: `
                vTextureId = aTextureIdAndRound.y;
            `,
        end: `
                if(aTextureIdAndRound.x == 1)
                {
                    vPosition = vec4<f32>(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
                }
            `
      },
      fragment: {
        header: `
                @in @interpolate(flat) vTextureId: u32;

                ${generateBindingSrc(maxTextures)}
            `,
        main: `
                var uvDx = dpdx(vUV);
                var uvDy = dpdy(vUV);

                ${generateSampleSrc(maxTextures)}
            `
      }
    };
  }
  return textureBatchBitGpuCache[maxTextures];
}
const textureBatchBitGlCache = {};
function generateSampleGlSrc(maxTextures) {
  const src = [];
  for (let i = 0; i < maxTextures; i++) {
    if (i > 0) {
      src.push("else");
    }
    if (i < maxTextures - 1) {
      src.push(`if(vTextureId < ${i}.5)`);
    }
    src.push("{");
    src.push(`	outColor = texture(uTextures[${i}], vUV);`);
    src.push("}");
  }
  return src.join("\n");
}
function generateTextureBatchBitGl(maxTextures) {
  if (!textureBatchBitGlCache[maxTextures]) {
    textureBatchBitGlCache[maxTextures] = {
      name: "texture-batch-bit",
      vertex: {
        header: `
                in vec2 aTextureIdAndRound;
                out float vTextureId;

            `,
        main: `
                vTextureId = aTextureIdAndRound.y;
            `,
        end: `
                if(aTextureIdAndRound.x == 1.)
                {
                    gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
                }
            `
      },
      fragment: {
        header: `
                in float vTextureId;

                uniform sampler2D uTextures[${maxTextures}];

            `,
        main: `

                ${generateSampleGlSrc(maxTextures)}
            `
      }
    };
  }
  return textureBatchBitGlCache[maxTextures];
}

const roundPixelsBit = {
  name: "round-pixels-bit",
  vertex: {
    header: (
      /* wgsl */
      `
            fn roundPixels(position: vec2<f32>, targetSize: vec2<f32>) -> vec2<f32> 
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `
    )
  }
};
const roundPixelsBitGl = {
  name: "round-pixels-bit",
  vertex: {
    header: (
      /* glsl */
      `   
            vec2 roundPixels(vec2 position, vec2 targetSize)
            {       
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `
    )
  }
};

const localUniformBit = {
  name: "local-uniform-bit",
  vertex: {
    header: (
      /* wgsl */
      `

            struct LocalUniforms {
                uTransformMatrix:mat3x3<f32>,
                uColor:vec4<f32>,
                uRound:f32,
            }

            @group(1) @binding(0) var<uniform> localUniforms : LocalUniforms;
        `
    ),
    main: (
      /* wgsl */
      `
            vColor *= localUniforms.uColor;
            modelMatrix *= localUniforms.uTransformMatrix;
        `
    ),
    end: (
      /* wgsl */
      `
            if(localUniforms.uRound == 1)
            {
                vPosition = vec4(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
            }
        `
    )
  }
};
const localUniformBitGroup2 = {
  ...localUniformBit,
  vertex: {
    ...localUniformBit.vertex,
    // replace the group!
    header: localUniformBit.vertex.header.replace("group(1)", "group(2)")
  }
};
const localUniformBitGl = {
  name: "local-uniform-bit",
  vertex: {
    header: (
      /* glsl */
      `

            uniform mat3 uTransformMatrix;
            uniform vec4 uColor;
            uniform float uRound;
        `
    ),
    main: (
      /* glsl */
      `
            vColor *= uColor;
            modelMatrix = uTransformMatrix;
        `
    ),
    end: (
      /* glsl */
      `
            if(uRound == 1.)
            {
                gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
            }
        `
    )
  }
};

class BatchableSprite {
  constructor() {
    // batch specific..
    this.vertexSize = 4;
    this.indexSize = 6;
    this.location = 0;
    // location in the buffer
    this.batcher = null;
    this.batch = null;
    this.roundPixels = 0;
  }
  get blendMode() {
    return this.renderable.groupBlendMode;
  }
  packAttributes(float32View, uint32View, index, textureId) {
    const sprite = this.renderable;
    const texture = this.texture;
    const wt = sprite.groupTransform;
    const a = wt.a;
    const b = wt.b;
    const c = wt.c;
    const d = wt.d;
    const tx = wt.tx;
    const ty = wt.ty;
    const bounds = this.bounds;
    const w0 = bounds.maxX;
    const w1 = bounds.minX;
    const h0 = bounds.maxY;
    const h1 = bounds.minY;
    const uvs = texture.uvs;
    const argb = sprite.groupColorAlpha;
    const textureIdAndRound = textureId << 16 | this.roundPixels & 65535;
    float32View[index + 0] = a * w1 + c * h1 + tx;
    float32View[index + 1] = d * h1 + b * w1 + ty;
    float32View[index + 2] = uvs.x0;
    float32View[index + 3] = uvs.y0;
    uint32View[index + 4] = argb;
    uint32View[index + 5] = textureIdAndRound;
    float32View[index + 6] = a * w0 + c * h1 + tx;
    float32View[index + 7] = d * h1 + b * w0 + ty;
    float32View[index + 8] = uvs.x1;
    float32View[index + 9] = uvs.y1;
    uint32View[index + 10] = argb;
    uint32View[index + 11] = textureIdAndRound;
    float32View[index + 12] = a * w0 + c * h0 + tx;
    float32View[index + 13] = d * h0 + b * w0 + ty;
    float32View[index + 14] = uvs.x2;
    float32View[index + 15] = uvs.y2;
    uint32View[index + 16] = argb;
    uint32View[index + 17] = textureIdAndRound;
    float32View[index + 18] = a * w1 + c * h0 + tx;
    float32View[index + 19] = d * h0 + b * w1 + ty;
    float32View[index + 20] = uvs.x3;
    float32View[index + 21] = uvs.y3;
    uint32View[index + 22] = argb;
    uint32View[index + 23] = textureIdAndRound;
  }
  packIndex(indexBuffer, index, indicesOffset) {
    indexBuffer[index] = indicesOffset + 0;
    indexBuffer[index + 1] = indicesOffset + 1;
    indexBuffer[index + 2] = indicesOffset + 2;
    indexBuffer[index + 3] = indicesOffset + 0;
    indexBuffer[index + 4] = indicesOffset + 2;
    indexBuffer[index + 5] = indicesOffset + 3;
  }
  reset() {
    this.renderable = null;
    this.texture = null;
    this.batcher = null;
    this.batch = null;
    this.bounds = null;
  }
}

function color32BitToUniform(abgr, out, offset) {
  const alpha = (abgr >> 24 & 255) / 255;
  out[offset++] = (abgr & 255) / 255 * alpha;
  out[offset++] = (abgr >> 8 & 255) / 255 * alpha;
  out[offset++] = (abgr >> 16 & 255) / 255 * alpha;
  out[offset++] = alpha;
}

export { BatchableSprite as B, GpuProgram as G, RendererType as R, Shader as S, TexturePool as T, UniformGroup as U, compileHighShaderGpuProgram as a, compileHighShaderGlProgram as b, color32BitToUniform as c, localUniformBitGl as d, roundPixelsBitGl as e, colorBit as f, generateTextureBatchBit as g, colorBitGl as h, generateTextureBatchBitGl as i, createIdFromString as j, localUniformBitGroup2 as k, localUniformBit as l, GlProgram as m, getAttributeInfoFromFormat as n, roundPixelsBit as r };

import Joi from 'joi'

// 书籍验证规则
const bookSchema = Joi.object({
  id: Joi.string().alphanum().min(2).max(20).optional(),
  title: Joi.string().min(1).max(100).required(),
  author: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional().allow(''),
  status: Joi.string().valid('draft', 'configuring', 'ready', 'generating', 'completed').optional(),
  canvas_id: Joi.string().optional(),
  cover: Joi.string().uri().optional().allow('')
})

// 书籍配置验证规则
const bookConfigSchema = Joi.object({
  title: Joi.string().min(1).max(100).optional(),
  author: Joi.string().min(1).max(100).optional(),
  canvas_id: Joi.string().optional(),
  row_num: Joi.number().integer().min(10).max(50).optional(),
  row_delta_y: Joi.number().integer().min(5).max(30).optional(),
  
  // 字体设置
  font1: Joi.string().optional(),
  font2: Joi.string().optional(),
  font3: Joi.string().optional(),
  font4: Joi.string().optional(),
  try_st: Joi.number().integer().valid(0, 1).optional(),
  
  // 正文字体大小
  text_font1_size: Joi.number().integer().min(20).max(200).optional(),
  text_font2_size: Joi.number().integer().min(20).max(200).optional(),
  text_font3_size: Joi.number().integer().min(20).max(200).optional(),
  text_font4_size: Joi.number().integer().min(20).max(200).optional(),
  text_font_color: Joi.string().optional(),
  
  // 批注字体大小
  comment_font1_size: Joi.number().integer().min(15).max(150).optional(),
  comment_font2_size: Joi.number().integer().min(15).max(150).optional(),
  comment_font3_size: Joi.number().integer().min(15).max(150).optional(),
  comment_font4_size: Joi.number().integer().min(15).max(150).optional(),
  comment_font_color: Joi.string().optional(),
  
  // 封面设置
  cover_title_font_size: Joi.number().integer().min(50).max(300).optional(),
  cover_title_y: Joi.number().integer().min(50).max(1000).optional(),
  cover_author_font_size: Joi.number().integer().min(30).max(200).optional(),
  cover_author_y: Joi.number().integer().min(100).max(1200).optional(),
  cover_font_color: Joi.string().optional(),
  
  // 版心设置
  if_tpcenter: Joi.number().integer().valid(0, 1).optional(),
  title_font_size: Joi.number().integer().min(30).max(200).optional(),
  title_font_color: Joi.string().optional(),
  title_y: Joi.number().integer().min(200).max(2000).optional(),
  title_postfix: Joi.string().optional().allow(''),
  title_directory: Joi.number().integer().valid(0, 1).optional(),
  
  // 页码设置
  pager_font_size: Joi.number().integer().min(20).max(100).optional(),
  pager_font_color: Joi.string().optional(),
  pager_y: Joi.number().integer().min(100).max(1000).optional(),
  
  // 标点符号处理
  exp_replace_comma: Joi.string().optional().allow(''),
  exp_replace_number: Joi.string().optional().allow(''),
  exp_delete_comma: Joi.string().optional().allow(''),
  if_nocomma: Joi.number().integer().valid(0, 1).optional(),
  exp_nocomma: Joi.string().optional().allow(''),
  if_onlyperiod: Joi.number().integer().valid(0, 1).optional(),
  exp_onlyperiod: Joi.string().optional().allow('')
})

// 背景图验证规则
const canvasSchema = Joi.object({
  id: Joi.string().alphanum().min(2).max(20).optional(),
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional().allow(''),
  style: Joi.string().valid('normal', 'vintage', 'bamboo').optional()
})

// 背景图配置验证规则
const canvasConfigSchema = Joi.object({
  canvas_width: Joi.number().integer().min(500).max(5000).optional(),
  canvas_height: Joi.number().integer().min(700).max(7000).optional(),
  canvas_color: Joi.string().optional(),
  
  // 边距设置
  margin_left: Joi.number().integer().min(20).max(200).optional(),
  margin_right: Joi.number().integer().min(20).max(200).optional(),
  margin_top: Joi.number().integer().min(20).max(200).optional(),
  margin_bottom: Joi.number().integer().min(20).max(200).optional(),
  
  // 列设置
  leaf_col: Joi.number().integer().min(1).max(20).optional(),
  leaf_col_width: Joi.number().integer().min(50).max(500).optional(),
  
  // 线条设置
  inline_width: Joi.number().integer().min(1).max(10).optional(),
  inline_color: Joi.string().optional(),
  outline_width: Joi.number().integer().min(1).max(20).optional(),
  outline_color: Joi.string().optional(),
  outline_hmargin: Joi.number().integer().min(0).max(50).optional(),
  outline_vmargin: Joi.number().integer().min(0).max(50).optional(),
  
  // 鱼尾设置
  fishtop_type: Joi.number().integer().valid(0, 1, 2).optional(),
  fishtop_y: Joi.number().integer().min(50).max(500).optional(),
  fishtop_rh: Joi.number().integer().min(10).max(100).optional(),
  fishtop_th: Joi.number().integer().min(5).max(50).optional(),
  
  fishbtm_direction: Joi.number().integer().valid(0, 1).optional(),
  fishbtm_y: Joi.number().integer().min(50).max(500).optional(),
  fishbtm_rh: Joi.number().integer().min(10).max(100).optional(),
  fishbtm_th: Joi.number().integer().min(5).max(50).optional(),
  
  // 鱼尾线设置
  fishtop_line_width: Joi.number().integer().min(0).max(10).optional(),
  fishbtm_line_width: Joi.number().integer().min(0).max(10).optional(),
  fish_line_color: Joi.string().optional(),
  fish_line_margin: Joi.number().integer().min(5).max(50).optional(),
  
  // 书房名设置
  logo_text: Joi.string().max(20).optional().allow(''),
  logo_y: Joi.number().integer().min(100).max(1000).optional(),
  logo_color: Joi.string().optional(),
  logo_font: Joi.string().optional(),
  logo_font_size: Joi.number().integer().min(20).max(200).optional()
})

// 验证中间件工厂函数
const createValidationMiddleware = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    })
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
      
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors
      })
    }
    
    req.body = value
    next()
  }
}

// 导出验证中间件
export const validateBook = createValidationMiddleware(bookSchema)
export const validateBookConfig = createValidationMiddleware(bookConfigSchema)
export const validateCanvas = createValidationMiddleware(canvasSchema)
export const validateCanvasConfig = createValidationMiddleware(canvasConfigSchema)

import fs from 'fs';
import path from 'path';

export const loadTemplate = (templateName, data = {}) => {
  const filePath = path.resolve('templates', templateName);
  let template = fs.readFileSync(filePath, 'utf-8');

  for (const key in data) {
    const value = data[key];
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        template = template.replace(new RegExp(`\\$\\{${key}\\[${index}\\]\\}`, 'g'), item);
      });
    } else {
      template = template.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
    }
  }

  return template;
};
export default loadTemplate;

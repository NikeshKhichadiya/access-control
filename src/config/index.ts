import { developmentConfig } from "./development";
import { productionConfig } from "./production";
export const config: any = process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig;
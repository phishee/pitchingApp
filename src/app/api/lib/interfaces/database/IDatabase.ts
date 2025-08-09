import { Collection, Document } from "mongodb";

export interface IDatabase {
    findAll(collection: string): Promise<any[]>;
    findQuery(collection: string, query: any): Promise<any[]>;
    findOne(collection: string, query: any): Promise<any>;
    create(collection: string, data: any): Promise<any>;
    update(collection: string, id: string, data: any): Promise<any>;
    delete(collection: string, id: string): Promise<any>;
    findById(collection: string, id: string): Promise<any>;
    findWithPopulate(collection: string, query: any, populate: PopulateOptions): Promise<any[]>;
    findByIdWithPopulate(collection: string, id: string, populate: PopulateOptions): Promise<any>;
    findWithPopulateSafe(collection: string, query: any, populate: SafePopulateConfig, options?: PopulateSafeOptions): Promise<any[]>;
}

export interface PopulateConfig {
    /** Field name in the source document to populate (e.g., 'userId', 'teamId') */
    path: string;
    
    /** Collection name to populate from (e.g., 'User', 'Team') */
    from: string;
    
    /** Local field name to use for matching (defaults to path) */
    localField?: string;
    
    /** Foreign field name to match against (defaults to auto-determined based on path) */
    foreignField?: string;
    
    /** Array of field names to select from the populated document */
    select?: string[];
    
    /** Alias name for the populated field in the result (defaults to path without 'Id' suffix) */
    as?: string;
  }

  export type PopulateOptions = PopulateConfig | PopulateConfig[];

  
  export interface PopulateSafeOptions {
    /** Exclude _id from main documents (default: true) */
    excludeMainId?: boolean;
    
    /** Exclude _id from populated documents (default: true) */
    excludePopulatedIds?: boolean;
    
    /** Additional field names to exclude from results */
    excludeFields?: string[];
  }

  // Update the SafePopulateConfig type to match your implementation
export type SafePopulateConfig = {
    path: string;
    from: string;
    localField?: string;
    foreignField?: string;
    select?: string[];
    as?: string;
  } | Array<{
    path: string;
    from: string;
    localField?: string;
    foreignField?: string;
    select?: string[];
    as?: string;
  }>;
  


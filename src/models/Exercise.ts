export interface Exercise {
  id: string;
  type: "exercise_template";
  version: string;
  image?: string;
  photoCover?: string;
  name: string;
  description: string;
  exercise_type: string;
  tags: string[];
  owner: string;
  
  instructions: {
    text?: string[];
    video?: string; // URL
    animationPicture?: string;
  };
  
  structure: string | "sets";
  
  settings: {
    sets_counting: boolean;
    reps_counting: boolean;
  };
  
  metrics: any[]; // You can define specific metric types later
  
  rpe: {
    type: "number";
    range: "1-10";
    description: string;
  };
}

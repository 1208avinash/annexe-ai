/*
  ANNEXE AI — Repository Integration Layer

  Connects:

  Generation Pipeline
          |
          v
  Repository Layer
          |
          v
  Branch
  Commit
  Pull Request


  V1:
  - In-memory repository workflow
  - No git commands
  - No GitHub API

*/


import { BranchManager }
from "./branch.js";


import { CommitManager }
from "./commit.js";


import { PullRequestManager }
from "./pull-request.js";


import { validateRepositoryAction }
from "./validator.js";

function normalizeFiles(files = []) {

    return files.map(file => ({

        name:
            file.path ||
            file.name ||
            "generated-file",

        path:
            file.path ||
            file.name ||
            "generated-file"

    }));

}


const branchManager =
    new BranchManager();


const commitManager =
    new CommitManager();


const pullRequestManager =
    new PullRequestManager();





export function integrateGenerationResult({

    projectId,

    task = {},

    generationResult = {},

    repositoryUrl = null

} = {}) {



    /*
      Safety check:
      Generation must already be successful.
    */

    if(!generationResult.success){

        return {

            success:false,

            stage:"generation",

            error:
            "Cannot create repository package from failed generation"

        };

    }




    const files =
    normalizeFiles(
        generationResult.generatedFiles || []
    );


    if(files.length === 0){

        return {

            success:false,

            stage:"repository",

            error:
            "No generated files available"

        };

    }





    /*
      1. Create working branch
    */

    const branch =
        branchManager.createBranch(

            projectId,

            task.id || "generation"

        );



    if(!branch.success){

        return branch;

    }





    /*
      Repository safety validation
    */

    const validation =
        validateRepositoryAction({

            type:"create_branch",

            branch:branch.branch

        });



    if(!validation.valid){

        return {

            success:false,

            stage:"validation",

            errors:
            validation.errors

        };

    }





    /*
      2. Create commit metadata
    */

    const commit =
        commitManager.createCommit({

            task,

            files

        });



    if(!commit.success){

        return commit;

    }





    /*
      3. Create Pull Request
    */

    const pullRequest =
        pullRequestManager.createPullRequest({

            projectId,

            branch:branch.branch,

            title:
            task.name ||
            "ANNEXE AI Generated Update",


            description:
            "Automated software generation completed by ANNEXE AI",


            changes:
            files.map(
                file => file.path
            ),


            tests:{
                status:
                generationResult.validation?.success
                ? "PASSED"
                : "UNKNOWN"
            }

        });



    if(!pullRequest.success){

        return pullRequest;

    }





    return {


        success:true,


        status:
        "READY_FOR_REVIEW",



        repository:{


            repositoryUrl,


            branch:


            branch.branch,



            commit:
            commit.commit,



            pullRequest:
            pullRequest.pullRequest


        },


        generatedFiles:
        files.length,


        createdAt:
        new Date().toISOString()


    };

}





export function getRepositoryState(){


    return {


        branches:
        branchManager.getBranches(),



        commits:
        commitManager.getCommits(),



        pullRequests:
        pullRequestManager.getPullRequests()


    };

}
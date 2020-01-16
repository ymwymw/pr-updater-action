import * as core from '@actions/core'
import * as github from '@actions/github'

const token = core.getInput('token')
const client = new github.GitHub(token)

async function main() {
    const baseBranch = github.context.payload.ref
    const pullsResponse = await client.pulls.list({
        ...github.context.repo,
        base: baseBranch,
        state: 'open',
    })
    const openPrs = pullsResponse.data
    console.log(`Branches (Open): ${openPrs.length}`)
    const filteredPrs = openPrs.filter(function (pr){
        console.log(`-PR: ${pr.number}`)
        return pr.labels.filter(function (label){
            console.log(`--Label: ${label.name}`)
            return label.name == 'automerge'
        }).length == 1
    })
    console.log(`Branches (Filtered): ${filteredPrs.length}`)
    console.log(`Data Dump:`)    
    openPrs.forEach(function (pr) {
        console.log(`=========================`)
        console.log(`PR: ${pr.number}`)
        console.log(`=========================`)
        console.log(pr)
    })
    console.log(`Merging '${baseBranch}' into branches with open pull requests that have the 'automerge' label`)
    await Promise.all(
        filteredPrs.map((pr) => {
            client.pulls.updateBranch({
                ...github.context.repo,
                pull_number: pr.number,
            })
        }),
    )
}

main()

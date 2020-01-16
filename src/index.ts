import * as core from '@actions/core'
import * as github from '@actions/github'

const token = core.getInput('token')
const client = new github.GitHub(token)

async function main() {
    const baseBranch = github.context.payload.ref
    console.log(`Merging ${baseBranch} into branches with open pull requests`)
    const pullsResponse = await client.pulls.list({
        ...github.context.repo,
        base: baseBranch,
        state: 'open',
    })
    const OpenPrs = pullsResponse.data
    console.log(`Branches (Open): ${OpenPrs.length}`)
    const filteredPrs = OpenPrs.filter(function (pr){pr.labels.filter(function (label){label.name == 'automerge'})})
    console.log(`Branches (Filtered): ${filteredPrs.length}`)
    filteredPrs.forEach(function (pr) {
        console.log(pr)
    })
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

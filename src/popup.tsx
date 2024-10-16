// TODO: Proper tree-shaking is broken at the moment. See: https://github.com/PlasmoHQ/plasmo/issues/997.
// import {} from "antd"
import Alert, { type AlertProps } from "antd/es/alert"
import Button from "antd/es/button"
import Flex from "antd/es/flex"
import Image from "antd/es/image"
import Select from "antd/es/select"
import Table, { type ColumnsType as TableColumnsType } from "antd/es/table"
import type { TableRowSelection } from "antd/es/table/interface"
import Tooltip from "antd/es/tooltip"
import Typography from "antd/es/typography"
import sweeperImage from "data-base64:~../assets/sweeper.png"
import xLogo from "data-base64:~../assets/x-logo.png"
import { useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import type {
  BlockBotsRequest,
  BlockBotsResponse
} from "~background/messages/block-bots"
import type { FindBotsRequest } from "~background/messages/find-bots"
import { rootDomain, type Bot, type FollowersFilter, type Rules } from "~shared"
import { ThemeProvider } from "~theme"
import { toFullSizeImage } from "~utils"

const { Title, Link } = Typography

type DataType = Bot

const columns: TableColumnsType<DataType> = [
  {
    title: "Profile",
    dataIndex: "profileImage",
    render: (imageUrl: string) => (
      <Image
        src={toFullSizeImage(imageUrl)}
        width={50}
        height={50}
        alt="profile image"
        style={{ borderRadius: "50%" }}
      />
    )
  },
  {
    title: "Name",
    dataIndex: "name",
    render: (_, row) => (
      <>
        <strong>{row.name}</strong>
        <br />
        <Link
          href={`https://${rootDomain}/${row.username}`}
          target="_blank"
          style={{ fontSize: 11 }}>
          @{row.username}
        </Link>
      </>
    )
  },
  {
    title: "Account Date",
    dataIndex: "createdAt",
    ellipsis: true,
    render: (date) => (
      <span title={date}>
        {new Intl.DateTimeFormat().format(new Date(date))}
      </span>
    )
  },
  { title: "Following", dataIndex: "followingCount" },
  { title: "Followers", dataIndex: "followersCount" },
  {
    title: () => (
      <Tooltip
        title="The following to followers ratio (calculated as following /
          followers).">
        <span>Ratio (?)</span>
      </Tooltip>
    ),
    dataIndex: "ratio",
    ellipsis: true,
    render: (ratio: number) => ratio.toFixed(2)
  },
  {
    title: "Reason",
    dataIndex: "matchedRule",
    render: (rule) => (
      <span style={{ fontSize: 11 }}>
        {rule === "followingToFollowersRatio"
          ? "Suspicious ratio"
          : "Banned keywords"}
      </span>
    )
  }
]

function IndexPopup() {
  const [bots, setBots] = useStorage<Bot[]>(
    {
      key: "bots",
      instance: new Storage({
        area: "local"
      })
    },
    []
  )
  const [selectedRows, setSelectedRows] = useStorage<string[]>(
    "checkedBotIds",
    []
  )
  const [filter, setFilter] = useState<FollowersFilter>("recent")
  const [status, setStatus] = useState<{
    message: string
    type: AlertProps["type"]
  }>()

  const onSelectChange = (newSelectedRowKeys: string[]) => {
    setSelectedRows(newSelectedRowKeys)
  }

  const findBots = async () => {
    setStatus({
      message: "Scanning your followers. This may take a while...",
      type: "info"
    })
    try {
      const res = await sendToBackground<FindBotsRequest>({
        name: "find-bots",
        body: {
          rules: { bannedKeywords: [], followingToFollowersRatio: 100 },
          filter
        }
      })
      setBots(res.bots)
      setStatus({ message: `Found ${res.bots.length} bot(s)`, type: "success" })
    } catch (error) {
      setStatus({ message: error.message ?? "Unknown error.", type: "error" })
    }
  }

  const blockBots = async () => {
    setStatus({
      message: "Blocking bots. This may take a while...",
      type: "info"
    })
    try {
      const { failedBlocks, succeededBlocks } = await sendToBackground<
        BlockBotsRequest,
        BlockBotsResponse
      >({
        name: "block-bots",
        body: { botIds: selectedRows, timeout: 2500 }
      })
      setBots((state) =>
        state.filter((bot) => !succeededBlocks.includes(bot.id))
      )
      setSelectedRows((state) =>
        state.filter((botId) => !succeededBlocks.includes(botId))
      )
      if (succeededBlocks.length > 0 && failedBlocks.length > 0) {
        setStatus({
          message: `Blocked ${succeededBlocks.length} bot(s) and failed to block ${failedBlocks.length} bot(s)`,
          type: "warning"
        })
      } else if (succeededBlocks.length > 0) {
        setStatus({
          message: `Blocked ${succeededBlocks.length} bot(s)`,
          type: "success"
        })
      } else if (failedBlocks.length > 0) {
        setStatus({
          message: `Failed to block ${failedBlocks.length} bot(s)`,
          type: "error"
        })
      } else {
        setStatus({ message: "No bots were blocked", type: "error" })
      }
    } catch (error) {
      setStatus({ message: error.message ?? "Unknown error.", type: "error" })
    }
  }

  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys: selectedRows,
    onChange: onSelectChange
  }

  return (
    <ThemeProvider>
      <Flex align="center" vertical style={{ marginBottom: 10, marginTop: 10 }}>
        <Flex align="center" justify="center" gap={4}>
          <img src={sweeperImage} width={40} height={40} alt="Sweeper image" />
          <Title level={1} style={{ margin: 0, padding: 0 }}>
            Bot Sweeper for
          </Title>
          <img src={xLogo} width={30} height={30} alt="X logo image" />
        </Flex>
        <strong>
          developed by{" "}
          <Link href={`https://${rootDomain}/sleeyax`} target="_blank">
            @sleeyax
          </Link>
        </strong>
      </Flex>
      {status?.message && (
        <Alert type={status.type} message={status.message} showIcon closable />
      )}
      <Flex gap={4} style={{ marginTop: 10, marginBottom: 10 }}>
        {selectedRows.length > 0 && (
          <Button type="primary" danger onClick={blockBots}>
            Block {selectedRows.length} bot(s)
          </Button>
        )}
        <Flex style={{ marginLeft: "auto" }} gap={4}>
          <Select
            value={filter}
            onChange={setFilter}
            options={[
              {
                value: "recent" satisfies FollowersFilter,
                label: "Recent followers"
              },
              { value: "all" satisfies FollowersFilter, label: "All followers" }
            ]}
            style={{ width: 150 }}
          />
          <Button type="primary" onClick={findBots}>
            Scan
          </Button>
        </Flex>
      </Flex>
      {bots.length > 0 && (
        <Table
          tableLayout="auto"
          rowSelection={rowSelection}
          columns={columns}
          dataSource={bots}
          rowKey={(record) => record.id}
          pagination={{ pageSize: 100 }}
        />
      )}
    </ThemeProvider>
  )
}

export default IndexPopup

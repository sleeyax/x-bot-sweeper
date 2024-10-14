import {
  Button,
  Flex,
  Image,
  Table,
  Typography,
  type TableColumnsType
} from "antd"
import type { TableRowSelection } from "antd/es/table/interface"
import sweeperImage from "data-base64:~../assets/sweeper.png"
import xLogo from "data-base64:~../assets/x-logo.png"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import type {
  BlockBotsRequest,
  BlockBotsResponse
} from "~background/messages/block-bots"
import { rootDomain, type Bot, type Rules } from "~shared"
import { ThemeProvider } from "~theme"
import { toFullSizeImage } from "~utils"

const { Title, Link } = Typography

type DataType = Bot

const columns: TableColumnsType<DataType> = [
  {
    title: "Profile",
    dataIndex: "profileImage",
    width: 50,
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
    width: 100,
    render: (_, row) => (
      <>
        <p>
          <strong>{row.name}</strong>
        </p>
        <Link href={`https://${rootDomain}/${row.username}`} target="_blank">
          @{row.username}
        </Link>
      </>
    )
  },
  {
    title: "Account Created At",
    dataIndex: "createdAt",
    width: 100,
    render: (date) => (
      <span title={date}>
        {new Intl.DateTimeFormat().format(new Date(date))}
      </span>
    )
  },
  { title: "Followers", dataIndex: "followersCount", width: 50 },
  { title: "Following", dataIndex: "followingCount", width: 50 },
  {
    title: "Ratio",
    dataIndex: "ratio",
    width: 50,
    render: (ratio: number) => ratio.toFixed(2)
  },
  {
    title: "Matched Rule",
    dataIndex: "matchedRule",
    width: 100,
    render: (rule) => (
      <>
        {rule === "followingToFollowersRatio"
          ? "Suspicious following to followers ratio"
          : "Found banned keywords"}
      </>
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

  const onSelectChange = (newSelectedRowKeys: string[]) => {
    setSelectedRows(newSelectedRowKeys)
  }

  const findRecentBots = async () => {
    const res = await sendToBackground<Rules>({
      name: "find-bots",
      body: { bannedKeywords: [], followingToFollowersRatio: 100 }
    })
    setBots(res.bots)
  }

  const blockBots = async () => {
    const { failedBlocks, succeededBlocks } = await sendToBackground<
      BlockBotsRequest,
      BlockBotsResponse
    >({
      name: "block-bots",
      body: { botIds: selectedRows, timeout: 2500 }
    })
    console.log("failedBlocks", failedBlocks)
    console.log("succeededBlocks", succeededBlocks)
    setBots((state) => state.filter((bot) => !succeededBlocks.includes(bot.id)))
    setSelectedRows((state) =>
      state.filter((botId) => !succeededBlocks.includes(botId))
    )
  }

  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys: selectedRows,
    onChange: onSelectChange
  }

  return (
    <ThemeProvider>
      <Flex align="center" vertical>
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
      <Flex gap={4} style={{ marginTop: 10, marginBottom: 10, width: "100%" }}>
        <Button type="primary" onClick={findRecentBots}>
          Scan recent followers
        </Button>
        <Button type="primary" onClick={findRecentBots}>
          Scan all followers
        </Button>
        {selectedRows.length > 0 && (
          <Button
            type="primary"
            danger
            onClick={blockBots}
            style={{ marginLeft: "auto" }}>
            Block {selectedRows.length} bot(s)
          </Button>
        )}
      </Flex>
      {bots.length > 0 && (
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={bots}
          rowKey={(record) => record.id}
          pagination={{pageSize: 100}}
        />
      )}
    </ThemeProvider>
  )
}

export default IndexPopup
